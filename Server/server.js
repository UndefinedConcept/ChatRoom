const WebSocket = require("ws");

// Server connection to 8080
const wss = new WebSocket.Server({
        port: 8080
});

// Constants
const rooms = new Map([]);
// { 'room1' (ROOM_NAME): {'users': [ <String>user: ws ], 'msg': []} }

// Server Stuff
wss.on("connection", function connection(ws) {
    // START of INITAL CONNECTION
    let username = '';
    let room = '';

    // END of INITAL CONNECTION
    ws.on("error", console.error);
    ws.on("message", function message(data) {
        const msg = JSON.parse(data);
        switch (msg["type"]) {
            case "msg":
                handle_message(username, room, data);
                break;
            case "CheckValid":
                // Sends "True" or "False"+error_msg
                break;
            case "join":
                username = msg["username"];
                room = msg["data"];
                room_join_and_creation(username, ws, room);
                break;
        }
    });

    ws.on('close', () => {
        if (username != '' && roomname != '') {
            rooms.get(roomname).get("users").delete(username);
        }
        ws.close();
        console.log(username +  " disconnected");
    });
        
});

function room_join_and_creation(username, ws, room_name){
    const room = rooms.get(room_name);
    if (room != undefined) {
        room.get("users").push(new Map([username,ws]));
    } else {
        rooms.set(room_name, new Map(["users", new Map()],["msg",[]]));
    }
}

function handle_message(username, room, msg_data) {
    let chat_room = rooms.get(room);
    if (chat_room != undefined) {
        let users = room.get("users");
        for (const [key, value] of users){
            value.send(JSON.stringify(new Map[["username",username], ["type","msg"], ["data",msg_data]]));
        }
    }
}

