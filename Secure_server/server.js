const sqlite3 = require("sqlite3");
const WebSocket = require("ws");
const fs = require("fs");
const forge = require("node-forge");
const config = JSON.parse(fs.readFileSync("config.json"));
const {v4: uuidv4} = require('uuid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const server_name = "server";

const saltRounds = 10;

const privateKey = forge.pki.privateKeyFromPem(fs.readFileSync(config.private_key, 'utf8'));
const publicKey = forge.pki.publicKeyFromPem(fs.readFileSync(config.public_key), 'utf8');

const jwtPublic = forge.pki.publicKeyFromPem(fs.readFileSync(config.jwtPublic), 'utf8');
const jwtPrivate = forge.pki.privateKeyFromPem(fs.readFileSync(config.jwtPrivate), 'utf8');

// Server connection to 8080
const wss = new WebSocket.Server({
    port: config.port
});

// Constants
const rooms = new Map(); // {"room": {uid: user}}

const db = new sqlite3.Database("users.db");

db.exec("CREATE TABLE IF NOT EXISTS users(username TEXT PRIMARY KEY, password TEXT)");

// Server Stuff
wss.on("connection", function connection(ws) {
    const user = {username: undefined, key: undefined, iv: undefined, decipher: undefined, cipher: undefined, uid: uuidv4(), ws: ws, room: undefined};

    console.log("New connection established");

    ws.on("error", console.error);
    ws.on("message", function message(data) {
        console.log(data);
        if (user.key == undefined) {
            try {
                intialize_user(data.data, user);
            } catch {
                ws.send(JSON.stringify({user: server_name, type: "error", data: {msg: "Unexpected error, closing connection"}}));
                ws.close();
            }
        } else {
            const msg = decrypt(data);
            const msg_data = JSON.parse(msg.data);
            switch (msg.type) {
                case "login":
                    user_login(msg_data, user);
                    break;
                case "create":
                    user_create(msg_data, user);
                    break;
                case "jwt":
                    user_auth(msg_data, user);
                    break;
                case "join_room":
                    join_room(msg_data, user);
                    break;
                case "message":
                    foward_message(msg_data, user);
                    break;
                default:
                    console.log("Error, unkown message:"+data);
            }
        }

    });

    ws.on('close', () => {
        if (user.room != undefined) {
            rooms.get(user.room).delete(user.uid);
        }
    });
});

function foward_message(data, user) {
    const room = rooms.get(user.room);
    if (room != undefined) {
        for (const [key, value] of room) {
            if (key !== user.uid) {
                sendLogged(value, {username: user.username, type: "msg", data: {timestamp: data.timestamp, msg: data.msg}});
            }
        }
    } else {
        sendLogged(user, {username: server_name, type: "error", data: {detail: "foward_message", msg: "Room does not exist, closing connection"}});
        user.ws.close();
    }
}

function intialize_user(data, user) {
    const inital_data = JSON.parse(privateKey.decrypt(data));
    user.iv = inital_data.iv
    user.key = inital_data.key
    user.cipher = forge.cipher.createCipher('AES-CBC', key);
    user.decipher = forge.cipher.createDecipher('AES-CBC', key);
    user.uid = uuidv4();
    console.log(user);
}

function join_room(data, user) {
    const room_name = data.room;
    let room = rooms.get(room_name);
    if (room == undefined) {
        room = new Map();
        rooms.set(room_name, room);
        room.set(user.uid, user);
        sendLogged(user, {username: server_name, type: "joined", data: {msg: "Sucessfully joined room " + room_name}});
    } else if (room.has(user.uid)) {
        sendLogged(user, {username: server_name, type: "error", data: {detail: "user_create", msg: "Duplicate user in room, closing connection"}});
        user.ws.close();
    } else {
        for (const [key, value] of room) {
            sendLogged(value, {username: server_name, type: "user_add", data: {username: user.username}});
        }
        room.set(user.uid, user);
        sendLogged(user, {username: server_name, type: "joined", data: {msg: "Sucessfully joined room " + room_name}});
    }
}

function user_auth(data, user) {
    const token = data.token;
    let result = false;
    jwt.verify(token, jwtPublic, function (err, decoded) {
        if (decoded != undefined) {
            user.username = decoded.username;
            result = true;
        }
    });
    return result;
}

function send_token(user) {
    const token = jwt.sign({username: username}, jwtPrivate, {algorithm: 'RS256'});
    sendLogged(user, {username: server_name, type: "token", data: {token: token}});
}

function user_create(data, user) {
    let query_result = undefined;
    const username = user.username.toLowerCase();
    const pattern = new RegExp("\\W");

    if (pattern.test(username)) {
        sendLogged(user, {username: server_name, type: "error", data: {detail: "user_create", msg: "Invalid username, username can only contain alphanumeric characters"}});
    } else {
        db.get("SELECT * FROM users WHERE username = ?", (username), function (err, row) {
            query_result = row;
        });
        if (query_result == undefined && username != server_name) {
            db.run("INSERT INTO users (?,?)", (username, hash_password(data.password)));
            user.username = data.username;
            send_token(user);
        } else {
            sendLogged(user, {username: server_name, type: "error", data: {detail: "user_create", msg: "Error, user already exists, please login or choose a different username"}});
        }
    }
}

function user_login(data, user) {
    const user_data = undefined;
    let valid_user = false;
    db.get("SELECT * FROM users WHERE username = ?", (data.username), function (err, row) {
        user_data = row;
    });
    if (row != undefined) {
        const hashing = forge.md.sha512.create();
        hashing.update(data.password);
        valid_user = data.username == user_data.username;
        if (valid_user) {
            bcrypt.compare(hashing.digest().toHex(), user_data.password, function (err, result) {
                valid_user = result;
            });
        }
    }
    if (valid_user) {
        user.username = user_data.username;
        send_token(user);
    } else {
        sendLogged(user, {username: server_name, type: "error", data: {detail: "user_login", msg: "Error, wrong username or password, please try again"}});
    }
}

function hash_password(password) {
    const hashing = forge.md.sha512.create();
    hashing.update(password);
    bcrypt.hash(hashing.digest().toHex(), saltRounds, function (err, hash) {
        return hash;
    });
}
function decrypt(data, decipher, iv) {
    decipher.start({iv: iv});
    decipher.update(data);
    return JSON.parse(decipher.output());
}

function sendLogged(user, message) {
    const cipher = user.cipher;
    cipher.start({iv: user.iv});
    cipher.update(forge.util.createBuffer(JSON.stringify(message)));
    cipher.finish();
    user.ws.send(cipher.output.getBytes());
    console.log(message);
}

console.log("on");