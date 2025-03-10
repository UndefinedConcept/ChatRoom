const saved_username = localStorage.getItem("username");
const saved_chatroom = localStorage.getItem("chatroom");

if (saved_username != undefined){
    document.getElementById("user_name").value = saved_username;
}

if (saved_chatroom != undefined) {
    document.getElementById("room_name").value = saved_chatroom;
}

document.addEventListener("keypress", function(event) {
    if (event.key == "Enter") {
        submit_login();
    }
});

function submit_login() {
    const username = document.getElementById("user_name").value;
    const chatroom = document.getElementById("room_name").value;
    if (username != "" && chatroom != "") {
        localStorage.setItem("username", username);
        localStorage.setItem("chatroom", chatroom);
        window.location.href = "chat.html";
    }
}