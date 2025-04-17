const username = localStorage.getItem("username");
const chatroom = localStorage.getItem("chatroom");

if (!username || !chatroom) {
        window.location.href = "index.html";
}

const webSocket = new WebSocket("ws://localhost:8080");

const messagesDiv = document.getElementById('message_box');
const usersDiv = document.getElementById('users_box');
const userInput = document.getElementById("input_box");

document.addEventListener("DOMContentLoaded", function (event) {
        document.getElementById("room_name").innerHTML = chatroom;
        document.getElementById("input_box").placeholder = "Message #"+chatroom;

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
                const joinRequest = { username: username, type: "joinRequest", data: chatroom };
                sendLogged(joinRequest);
        };
});

webSocket.onmessage = (event) => {
        // ALL RECIEVED MESSAGES PAST THROUGH HERE
        // TODO-SECURITY - de-encryption the outgoing message here
        const data = JSON.parse(event.data);
        console.log("Received: " + event.data);
        switch (data.type) {
                case "joinReply":
                        if (data.detail) {
                                const currentUsers = data.users;
                                currentUsers.forEach(user => addUser(user, "online_users"));
                        } else {
                                console.warn("User not allowed. Redirecting to homepage.");
                                window.location.href = "index.html?error=" + data["error"];  // Redirect to home page
                        }
                        break;
                case "msg":
                        addMessage(data);
                        break;
                case "error":
                        console.error("Error received:", data.data);
                        break;
                case "info":
                        addInfo(data);
                        break;
                default:
                        console.warn("Unknown type:", data.type);
                        break;
        }
};

function sendLogged(message) {
        // ALL MESSAGES *MUST* BE PAST THROUGH HERE TO BE SENT OUT
        dataBeingSent = JSON.stringify(message);
        console.log("Sending:", dataBeingSent);
        // TODO-SECURITY - encryption the outgoing message here
        webSocket.send(dataBeingSent);
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
        return message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/~~(.*?)~~/g, '<span style="text-decoration: line-through;">$1</span>').replace(/\*(.*?)\*/g, '<em>$1</em>').replace(/~(.*?)~/g, '<sub>$1</sub>').replace(/\^(\S+)\^/g, '<sup>$1</sup>').replace(/https?:\/\/[^\s]+/g, '<a href="$&" target="_blank">$&</a>').replace(/\n/g, "</br>");
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
                sendLogged({ username: username, type: "msg", data: userInput.value.trim() });
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