const sqlite3 = require("sqlite3");
const WebSocket = require("ws");
const fs = require("fs");
const forge = require("node-forge");
const config = JSON.parse(fs.readFileSync("config.json"));
const { v4: uuidv4 } = require('uuid');


const privateKey = forge.pki.privateKeyFromPem(fs.readFileSync(config.private_key, 'utf8'));
const publicKey = forge.pki.publicKeyFromPem(fs.readFileSync(config.public_key), 'utf8');

// Server connection to 8080
const wss = new WebSocket.Server({
    port: config.port
});

// Constants
const rooms = new Map(); // {"room": {uid:}}

const db = new sqlite3.Database("users.db");

db.exec("CREATE TABLE IF NOT EXISTS users(username TEXT PRIMARY KEY, password TEXT, token TEXT, salt TEXT)");

// Server Stuff
wss.on("connection", function connection(ws) {
    const user = {username:undefined, key:undefined, iv:undefined, decipher:undefined, cipher:undefined, uid:uuidv4()};

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
            switch(msg.type) {
                    case "login":
                        user_login(JSON.parse(msg.data));
                        break;
            }
        }

    });

    ws.on('close', () => {
        
    });
});

function user_login(msg) {
    const user_data = undefined;
    db.get("SELECT * FROM users WHERE username = ?",(msg.username),function(err, row){
        user_data = row;
    });
    if (row == undefined) {
        return false;
    } else {
        
    }
    

}

function create_user(username, password) {
    password = forge.sha512()
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

function sendLogged(ws, message) {
    
}

console.log("on");