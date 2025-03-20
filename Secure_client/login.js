const config = {
    "key": "-----BEGIN PUBLIC KEY-----MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA9KqO58Kia0PPKvZQ0P8n2yyESR8GM69O9YbL0a57Otw43wpQ1EQx7ICUd/34YBYqsfrbnwKDETRwxI9YZTrNs/5rUMvyid+dClElHbHsKlgn1b1nRd3eflcsj/fOK1dXMsVkm7Ieq2wU6y3r2wwlUR0oelj3hN/PCAGJGeZxiWJh8Q9lLDRCob78OepoGQrq9LCYTw9JFtoxVwPcebl/hAX9PwCUf8cFlT1PYYdwiyCNo9vOaHjpuy618vUzoUyvzV/Ce9W58ZhRKzRgeUJ2rRfnvXsO8+psMvtbD8MVUhuqA4GtuG/JkwA0eC5764sOr2A6VNlh00N1ktAfDZxPNQIDAQAB-----END PUBLIC KEY-----",
    "server": "ws://localhost:8080"
}

const webSocket = new WebSocket(config.server);

const publicKey = forge.pki.publicKeyFromPem(config.key, 'utf8');

const key = forge.random.getBytesSync(32);
const iv = forge.random.getBytesSync(32);

const cipher = forge.cipher.createCipher('AES-CBC', key);
const decipher = forge.cipher.createDecipher('AES-CBC', key);

const cookie = document.cookie;

const username_input = document.getElementById("user_name");
const password_input = document.getElementById("password");
const saved_username = localStorage.getItem("username");

let uid = undefined;


document.addEventListener("DOMContentLoaded", function (event){
    webSocket.onopen = function(event) {
        console.log("Connection made");
        webSocket.send(publicKey.encrypt({key:key, iv:iv}));
    }
    if (saved_username != undefined) {
        username_input.value = saved_username;
    }
    
});

webSocket.onmessage() = function(event) {
    const msg = decrypt(event.data);
    const msg_data = JSON.parse(msg.data);
    switch(msg.type) {
        case "awk":
            process_start(msg_data);
            break;
        case "error":
            error(msg_data);
            break;
        case "confirm":
            login_sucessful(msg_data);
            break;
        case "token":
            document.cookie = msg_data.token;
            break;
    }
}

function login_sucessful(data) {
    localStorage.setItem("username", data.username);
    window.location.href = "index.html";
}

function login() {
    if (username_input.value != "" && password_input.value !="") {
        const hashing = forge.md.sha512.create();
        hashing.update(password_input.value);
        sendLogged({username:uid, type:"login", data: {username: username_input.value, password: hashing.digest.toHex()}});
    }
}

function error(data) {
    if (data.detail != "token_invalid") {
        window.alert(data.msg);
    } 
}

function process_start(data){
    uid = data.uid;
    if (cookie != "") {
        sendLogged({uid:uid, type:"jwt", data: {token: cookie}});
    }
}

function decrypt(data) {
    decipher.start({iv: iv});
    decipher.update(data);
    return JSON.parse(decipher.output());
}

function sendLogged(message) {
    const msg = {username:uid, message};
    cipher.update(forge.util.createBuffer(JSON.stringify(msg)));
    cipher.finish();
    webSocket.send(cipher.output.getBytes());
    console.log(message);
}

function create_user(){
    if (username_input.value != "" && password_input.value !="") {
        const hashing = forge.md.sha512.create();
        hashing.update(password_input.value);
        sendLogged({username:uid, type:"create", data: {username: username_input.value, password: hashing.digest.toHex()}});
    }
}