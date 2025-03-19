const sqlite3 = require("sqlite3");
const WebSocket = require("ws");
const fs = require("fs");
const forge = require("node-forge");
const config = JSON.parse(fs.readFileSync("config.json"));
const {v4: uuidv4} = require('uuid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {decode} = require("punycode");

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
const rooms = new Map(); // {"room": {uid:}}

const db = new sqlite3.Database("users.db");

db.exec("CREATE TABLE IF NOT EXISTS users(username TEXT PRIMARY KEY, password TEXT, salt TEXT)");

// Server Stuff
wss.on("connection", function connection(ws) {
    const user = {username: undefined, key: undefined, iv: undefined, decipher: undefined, cipher: undefined, uid: uuidv4(), ws:ws, room:undefined};

    console.log("New connection established");

    ws.on("error", console.error);
    ws.on("message", function message(data) {
        console.log(data);
        if (user.key == undefined) {
            const inital_data = JSON.parse(privateKey.decrypt(data));
            user.iv = inital_data.iv
            user.key = inital_data.key
            user.cipher = forge.cipher.createCipher('AES-CBC', key);
            user.decipher = forge.cipher.createDecipher('AES-CBC', key);
            user.uid = uuidv4();
            console.log(user);
        } else {
            const msg = decrypt(data);
            switch (msg.type) {
                case "login":
                    user_login(JSON.parse(msg.data), user);
                    break;
                case "create":
                    user_create(JSON.parse(msg.data), user);
                    break;
                case "jwt":
                    if (user_auth(JSON.parse(msg.data), user)) {
                        user.username = data.username;
                    }
                    break;
            }
        }

    });

    ws.on('close', () => {

    });
});

function user_auth(data, user) {
    const token = data.token;
    jwt.verify(token, jwtPublic, function(err, decoded) {
        if (decoded != undefined) {

        }
    });
}

function user_create(msg) {
    const user_data = JSON.parse(msg.data);
}

function user_login(data, user) {
    const user_data = undefined;
    
    db.get("SELECT * FROM users WHERE username = ?", (data.username), function (err, row) {
        user_data = row;
    });

    if (row == undefined) {
        return {error:true, error_msg:"Create a user account prior to logging in"};
    } else {
        const hashed_password = hash_password(data.password, user_data.salt);
        let matches = undefined;
        bcrypt.compare(hash_password, user_data.password, function(err, result){
            matches = result;
        });
        if (matches) {
            
        }
    }


}

function hash_password(password, salt) {
    const hashing = forge.md.sha512.create();
    hashing.update(password + salt);
    bcrypt.hash(hashing.digest().toHex(), saltRounds, function (err, hash) {
        return hash;
    });

}

function create_user(username, password) {
    const hashing = forge.md.sha512.create();

}

function encrypt(data, cipher, iv) {
    cipher.start({iv: iv});
    cipher.update(forge.util.createBuffer(data));
    cipher.finish();
    return cipher.output.getBytes();
}

function decrypt(data, decipher, iv) {
    decipher.start({iv: iv});
    decipher.update(data);
    return JSON.parse(decipher.output());
}

function sendLogged(user, message) {
    user.ws.send(encrypt(message));
    console.log(message);
}

console.log("on");