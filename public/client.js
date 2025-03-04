
// Local User Stuff
const username = localStorage.getItem("username");
const chatroom = localStorage.getItem("chatroom");

if (username == null || chatroom == null) {
        window.location.href = "index.html";
}

//err erError message console.log("hi");

const webSocket = new WebSocket("ws://localhost:8080")

// Webserver Stuff
const messagesDiv = document.getElementById('message_box');
const usersDiv = document.getElementById('users_box');

document.getElementById("test").addEventListener("click", function(event) {
        console.log("click");
        webSocket.send("click");
});

webSocket.onopen = (event) => {
        webSocket.send(JSON.stringify(new Map(["username",username], ["type", "join"], ["data", chatroom])));
        console.log("connected to server")
}

webSocket.onmessage = (event) => {
        // message: {timestamp, username, messsageType, message}
        const message = event.data;
        console.log(message);
}

function addMessage(data) {
        // ARGS: json {timestamp, username, message}
        const messageElement = document.createElement('div');
        messageElement.classList.add('msg');
        messageElement.innerHTML = `[${data.timestamp}] ${data.username}: ${formatMessage(data.message)}`; // Allow HTML rendering for formatting
        messagesDiv.appendChild(messageElement);
        window.scrollTo(0, document.body.scrollHeight);
}