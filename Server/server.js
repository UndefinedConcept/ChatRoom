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
    // Code for Inital Connectio

    let username = '';
    let roomname = '';

    ws.on('check', () => {
        
    });
    ws.on("error", console.error);
    ws.on("message", function message(data) {
        const msg = JSON.parse(data);
        switch (msg["type"]) {
            case "msg":
                handle_message(username, room, JSON.parse(msg["data"]));
                break;
        }
    });

    ws.on('close', () => {
        if (username != '' && roomname != '') {
            rooms.get(roomname).get("users").delete(username);
        }
        console.log(username +  " disconnected");
    });
        
});

function handle_message(username, room, msg_data) {
    let chat_room = rooms.get(room);
    if (chat_room != undefined) {
        let users = room.get("users");
        for (user in users) {
            
        }
    }
}

function create_room(room_name) {
    // 
    // RETURNS: void
    rooms.set(room_name, [], []);
}

function is_unique_username(username, room) {
    // 
    // RETURNS: 
    return !(user in rooms.get(room).get("users"));
}

function add_user(username, ws, room) {
    // 
    // RETURNS: 
    rooms.get(room).get(users).push(Map([[username,ws]]));
}

function remove_user(username) {
    // 
    // RETURNS: 
    users.delete(username);
}







console.log("on");