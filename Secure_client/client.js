const username = localStorage.getItem("username");
const chatroom = localStorage.getItem("chatroom");

if (!username || !chatroom) {
        window.location.href = "index.html";
}

const config = {
        "key": "-----BEGIN PUBLIC KEY-----MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA9KqO58Kia0PPKvZQ0P8n2yyESR8GM69O9YbL0a57Otw43wpQ1EQx7ICUd/34YBYqsfrbnwKDETRwxI9YZTrNs/5rUMvyid+dClElHbHsKlgn1b1nRd3eflcsj/fOK1dXMsVkm7Ieq2wU6y3r2wwlUR0oelj3hN/PCAGJGeZxiWJh8Q9lLDRCob78OepoGQrq9LCYTw9JFtoxVwPcebl/hAX9PwCUf8cFlT1PYYdwiyCNo9vOaHjpuy618vUzoUyvzV/Ce9W58ZhRKzRgeUJ2rRfnvXsO8+psMvtbD8MVUhuqA4GtuG/JkwA0eC5764sOr2A6VNlh00N1ktAfDZxPNQIDAQAB-----END PUBLIC KEY-----",
        "server": "ws://localhost:8080"
}

const webSocket = new WebSocket(config.server);

const messagesDiv = document.getElementById('message_box');
const usersDiv = document.getElementById('users_box');
const userInput = document.getElementById("input_box");

const publicKey = forge.pki.publicKeyFromPem(config.key, 'utf8');

const key = forge.random.getBytesSync(32);
const iv = forge.random.getBytesSync(32);
const cipher = forge.cipher.createCipher('AES-CBC', key);

const decipher = forge.cipher.createDecipher('AES-CBC', key);

const cookie = document.cookie;

let uid = "";

let authincated = false;

if (cookie == "") {
        window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", function (event) {
        document.getElementById("room_name").innerHTML = chatroom;
        document.getElementById("input_box").placeholder = "Message #" + chatroom;

        userInput.addEventListener("input", function () {
                this.style.height = 'auto';
                this.style.height = this.scrollHeight + 'px';

                const maxHeight = window.getComputedStyle(this).maxHeight;
                if (parseInt(this.style.height) > parseInt(maxHeight)) {
                        this.style.height = maxHeight;
                }
        });

        // Enable sending messages after joining
        document.addEventListener("keypress", function (event) {
                if (event.key == "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        submitMessage();
                }
        });

        // Wait for WebSocket to open before sending the join request
        webSocket.onopen = async () => {
                console.log("Connected to server");
                webSocket.send(publicKey.encrypt({"key": key, "iv": iv}));
                /*const joinRequest = { username: username, type: "joinRequest", data: chatroom };
                sendLogged(joinRequest);*/
        };
});

function encrypt(data) {
        cipher.start({iv: iv});
        cipher.update(forge.util.createBuffer(data));
        cipher.finish();
        return cipher.output.getBytes();
}

function decrypt(data) {
        decipher.start({iv: iv});
        decipher.update(data);
        return JSON.parse(decipher.output.data);
}

webSocket.onmessage = (event) => {
        const msg = decrypt(event.data);
        const msg_data = msg.data; 
        console.log("Received: " + event.data);
        switch (data.type) {
                case "awk":
                        uid = msg_data.uid;
                        process_start(msg_data);
                case "msg":
                        addMessage(msg_data);
                        break;
                case "error":
                        error(msg_data);
                        break;
                case "info":
                        addInfo(msg_data);
                        break;
                case "confirm":
                        authincated = true;
                        join(msg_data);
                        break;
                default:
                        console.warn("Unknown type:", data.type);
                        break;
        }
};

function join(data) {
        sendLogged({user: username, type:"join_room", data: {room: chatroom}});
        addUser(username, "online_users");
}

function error(data) {
        if (data.detail == "token_invalid") {
                document.cookie = "";
                window.location.href = "login.html";
        } else {
                console.warn(data);
        }
}

function process_start(data) {
        uid = data.uid;
        if (cookie != "") {
                sendLogged({uid: uid, type: "jwt", data: {token: cookie}});
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

function addInfo(data) {
        switch (data.detail) {
                case "join":
                        const users = data.users;
                        users.forEach(user => addUser(user, "online_users"));
                        break;
                case "leave":
                        removeUserByName(data.username);
                        break;
                case "add":
                        addUser(data.username, "online_users");
                        break;
                default:
                        console.warn("Unknown info detail:", data.detail);
                        break;
        }
}

function formatMessage(message) {
        return message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/~~(.*?)~~/g, '<span style="text-decoration: line-through;">$1</span>').replace(/\*(.*?)\*/g, '<em>$1</em>').replace(/~(.*?)~/g, '<sub>$1</sub>').replace(/\^(\S+)\^/g, '<sup>$1</sup>').replace(/https?:\/\/[^\s]+/g, '<a href="$&" target="_blank">$&</a>').replace(/\\n/g, "</br>");
}

function addMessage(data) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('msg');
        messageElement.innerHTML = `
        <div class="msg-info">
            <span class="msg-user">${data.username}</span>
            <span class="msg-time">${data.timestamp}</span>
        </div>
        ${formatMessage(data.data)}`;
        messagesDiv.appendChild(messageElement);
        window.scrollTo(0, document.body.scrollHeight);
}

document.getElementById("submit").addEventListener("click", submitMessage);

function submitMessage() {
        if (userInput.value.trim()) {
                sendLogged({username: username, type: "msg", data: {msg: userInput.value.trim()}});
                userInput.value = "";
                userInput.style.height = 'auto';
        } else {
                console.warn("Message input is empty.");
        }
}

class UserList {
        constructor() {
                this.users = {};
        }

        addUser(username, status) {
                if (this.users[username]) {
                        console.warn(`[UserList] User with name "${username}" already exists!`);
                        return;
                }
                this.users[username] = status;
                const userBox = document.getElementById(status);
                const usersBox = userBox.querySelector('.userContainer');
                const userInfoDiv = document.createElement('div');
                userInfoDiv.className = 'user_info';
                userInfoDiv.textContent = username;
                usersBox.appendChild(userInfoDiv);
                this.updateUserCount(userBox, true);
        }

        removeUser(username) {
                if (this.users[username]) {
                        const status = this.users[username];
                        const userBox = document.getElementById(status);
                        const usersBox = userBox.querySelector('.userContainer');
                        const userDivToRemove = Array.from(usersBox.children).find(div => div.textContent === username);
                        if (userDivToRemove) {
                                usersBox.removeChild(userDivToRemove);
                        }
                        delete this.users[username];
                        this.updateUserCount(userBox, false);
                } else {
                        console.warn(`[UserList] User "${username}" does not exist!`);
                }
        }

        updateUserCount(userBox, isAdding) {
                const userCountElement = userBox.querySelector('#number_of_users');
                let currentCount = parseInt(userCountElement.textContent, 10);
                if (isNaN(currentCount)) {
                        currentCount = userBox.querySelectorAll('.user_info').length;
                } else if (isAdding) {
                        currentCount += 1;
                } else {
                        currentCount -= 1;
                }
                userCountElement.textContent = currentCount;
        }
}

const userList = new UserList();

function addUser(username, status) {
        userList.addUser(username, status);
}

function removeUserByName(username) {
        userList.removeUser(username);
}