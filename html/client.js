
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
const user_input = document.getElementById("input_box");

document.addEventListener("DOMContentLoaded", function(event){
        document.getElementById("room_name").innerHTML = chatroom;
        user_input.addEventListener("input", function () {
          // Reset the height to allow for recalculating
          this.style.height = 'auto';
          // Set the height to match the scrollHeight (content height)
          this.style.height = this.scrollHeight + 'px';

          // Check if the height exceeds max-height
          const maxHeight = window.getComputedStyle(this).maxHeight;
          if (parseInt(this.style.height) > parseInt(maxHeight)) {
            this.style.height = maxHeight; // Set to max-height if exceeded
          }
        });
});

document.addEventListener("keypress", function(event){
        if (event.key == "Enter" && !event.shiftKey) {
                event.preventDefault();
                submit_message();
        }
})

webSocket.onopen = (event) => {
        let msg = {username:username, type:"join", data:chatroom};
        webSocket.send(JSON.stringify(msg));
        console.log("connected to server")
}

webSocket.onmessage = (event) => {
        // message: {timestamp, username, messsageType, message}
        const data = JSON.parse(event.data);
        switch (data["type"]) {
                case "msg":
                        addMessage(data);
                        break;
                case "error":
                        let error_message = data["data"];
                        //TODO Figure out how to redirect user back, you do this
                        break;
        }
        
        console.log(data);
}

function formatMessage(message) {
        // Replace shortcuts with HTML tags
        return message
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
            .replace(/~~(.*?)~~/g, '<span style="text-decoration: line-through;">$1</span>') // Strikethrough
            .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italics
            .replace(/~(.*?)~/g, '<sub>$1</sub>') // Subscript
            .replace(/\^(\S+)\^/g, '<sup>$1</sup>') // Superscript
            .replace(/https?:\/\/[^\s]+/g, '<a href="$&" target="_blank">$&</a>') // Links
            .replace(/\\n/g,"</br>");  // New Line
}

function addMessage(data) {
        // ARGS: json {timestamp, username, message}
        const messageElement = document.createElement('div');
        messageElement.classList.add('msg');
        messageElement.innerHTML = data["timestamp"] +"  " + data["username"] + "  " + formatMessage(data["data"]); // Allow HTML rendering for formatting
        messagesDiv.appendChild(messageElement);
        window.scrollTo(0, document.body.scrollHeight);
}

document.getElementById("submit").addEventListener("click", function(event){
        submit_message();
});

function submit_message() {
        if (user_input.value != "" && user_input.value.trim()!=""){
                webSocket.send(JSON.stringify({username:username, type:"msg", data:user_input.value.trim()}));
        }
        user_input.value = "";
        user_input.style.height = 'auto';
}
