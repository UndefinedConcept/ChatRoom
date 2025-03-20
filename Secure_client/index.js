const saved_chatroom = localStorage.getItem("chatroom");

const room_name_elm = document.getElementById("room_name");

document.addEventListener("DOMContentLoaded", function (event){
    webSocket.onopen = function(event) {
        console.log("Connection made");
        webSocket.send(publicKey.encrypt({key:key, iv:iv}));
    }
    if (saved_chatroom != undefined) {
        room_name_elm.value = saved_chatroom;
    }
});


document.addEventListener("keypress", function(event) {
    if (event.key == "Enter") {
        join();
    }
});

function join() {
    const chatroom = document.getElementById("room_name").value;
    if (chatroom != "") {
        window.location.href = "chat.html";
    }
}