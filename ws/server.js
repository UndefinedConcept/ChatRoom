const WebSocket = require("ws");

// Server connection to 8080
const wss = new WebSocket.Server({
    port: 8080
});

// Constants
const rooms = new Map();
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
        console.log(msg);
        switch (msg["type"]) {
            case "msg":
                handle_message(username, room, data);
                break;
            case "join":
                allowed_user = true;
                username = msg["username"];
                room = msg["data"];
                room_map = rooms.get(room);
                if (room_map != undefined) {
                    users = room_map.get("users");
                    if (users.get(username) != undefined) {
                        ws.send(JSON.stringify({type: "error", data: "not unique user"}));
                        ws.close();
                        allowed_user = false;
                    } 
                }
                if (allowed_user) {
                    room_join_and_creation(username, ws, room);
                }
                break;
        }
    });

    ws.on('close', () => {
        if (username != '' && room != '') {
            rooms.get(room).get("users").delete(username);
        }
        ws.close();
        console.log(username + " disconnected");
    });

});

function room_join_and_creation(username, ws, room_name) {
    let room = rooms.get(room_name);
    if (room == undefined) {
        rooms.set(room_name, new Map([["users", new Map()], ["msg", []]]));
        room = rooms.get(room_name);
    }
    let users = room.get("users");
    users.set(username, ws);
}

function handle_message(username, room, msg_data) {
    let chat_room = rooms.get(room);
    const msg = JSON.parse(msg_data).data;
    if (chat_room != undefined) {
        let users = chat_room.get("users");
        for (const [key, value] of users) {
            value.send(JSON.stringify({username: username, type: "msg", data: msg, timestamp: new Date().toLocaleString()}));
        }
    }
}

