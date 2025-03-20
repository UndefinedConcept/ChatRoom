const saved_chatroom = localStorage.getItem("chatroom");

const room_name_elm = document.getElementById("room_name");

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

const saved_username = localStorage.getItem("username");

let authincated = false;

if (cookie == "") {
    window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", function (event) {
    webSocket.onopen = function (event) {
        console.log("Connection made");
        webSocket.send(publicKey.encrypt({key: key, iv: iv}));
    }
    if (saved_username != undefined) {
        document.getElementById("user").innerHTML = saved_username;
    }
    if (saved_chatroom != undefined) {
        room_name_elm.value = saved_chatroom;
    }
});

webSocket.addEventListener("message", function(event){
    const msg = decrypt(event.data);
    const msg_data = JSON.parse(msg.data);
    switch (msg.type) {
        case "awk":
            process_start(msg_data);
            break;
        case "error":
            error(msg_data);
            break;
        case "confirm":
            authincated = true;
            break;
        case "continue":
            window.location.href = "chat.html";
            break;
    }
});

function process_start(data) {
    uid = data.uid;
    if (cookie != "") {
        sendLogged({uid: uid, type: "jwt", data: {token: cookie}});
    }
}

function error(data) {
    if (data.detail == "token_invalid") {
        document.cookie = "";
        window.location.href = "login.html";
    }
}


document.addEventListener("keypress", function (event) {
    if (event.key == "Enter") {
        join();
    }
});

function join() {
    const chatroom = document.getElementById("room_name").value;
    if (chatroom != "" && authincated) {
        sendLogged({type:"check_room", room:chatroom});
        localStorage.setItem("chatroom", chatroom);
    }
}

function sendLogged(message) {
    const msg = {username: uid, message};
    cipher.update(forge.util.createBuffer(JSON.stringify(msg)));
    cipher.finish();
    webSocket.send(cipher.output.getBytes());
    console.log(message);
}

function decrypt(data) {
    decipher.start({iv: iv});
    decipher.update(data);
    return JSON.parse(decipher.output());
}