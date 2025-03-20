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

document.addEventListener("DOMContentLoaded", function (event){
    webSocket.onopen = function(event) {
        console.log("Connection made");
        webSocket.send(publicKey.encrypt({key:key, iv:iv}));
    }
});



function sendLogged(message) {
    cipher.update(forge.util.createBuffer(JSON.stringify(message)));
    cipher.finish();
    webSocket.send(cipher.output.getBytes());
    console.log(message);
}

function create_user(){

}

function submit_login() {

}