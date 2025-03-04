

//err erError message console.log("hi");

const webSocket = new WebSocket("ws://10.42.0.1:8080")

document.getElementById("test").addEventListener("click", function(event) {
        console.log("click");
        webSocket.send("click");
});

webSocket.onopen = (event) => {
        console.log("connected to server")
}

webSocket.onmessage = (event) => {
        // message: {timestamp, username, messsageType, message}
        const message = event.data;
        console.log(message);
}