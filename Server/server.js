const WebSocket = require("ws");

// Server connection to 8080
const wss = new WebSocket.Server({
    port: 8080
});

// Constants
const rooms = new Map(); // { 'room1': {'users': [ <String>user: ws ], 'msg': []} }

// Server Stuff
wss.on("connection", function connection(ws) {
    let username = '';
    let room = '';

    console.log("New connection established");

    ws.on("error", console.error);
    ws.on("message", function message(data) {
        // ALL RECIEVED MESSAGES PAST THROUGH HERE
        // TODO-SECURITY - de-encryption the outgoing message here
        const msg = JSON.parse(data);
        console.log("Received:", msg);
        switch (msg["type"]) {
            case "msg":
                handleMessage(username, room, data);
                break;
            case "joinRequest":
                [username, room] = handleJoinRequest(ws, msg);
                break;
            default:
                console.warn("Unknown message type:", msg["type"]);
                break;
        }
    });

    ws.on('close', () => {
        removeUser(ws, username, room);
    });
});

function handleJoinRequest(ws, msg) {
    const allowedUser = true;
    const username = msg["username"];
    const room = msg["data"];
    const roomMap = rooms.get(room);

    if (roomMap !== undefined) {
        const users = roomMap.get("users");
        if (users.get(username) !== undefined) {
            sendLogged(ws, { type: "joinReply", detail: false, error: "Username Already Taken"});
            ws.close();
            return ["",""];
        }
    }
    roomJoinAndCreation(username, ws, room);
    sendLogged(ws, { type: "joinReply", detail: true, users: Array.from(rooms.get(room).get("users").keys()) });
    addToUserList(username, room, ws);
    console.log("JOIN ["+room+"] User \""+username+"\" connected");
    return [username, room];
}

function addToUserList(username, room, ws) {
    const users = rooms.get(room).get("users");
    for (const [key, value] of users) {
        if (key !== username){
            value.send(JSON.stringify({ username: username, type: "info", detail: "add" }));
        }
    }
}

function removeUser(ws, username, room) {
    if (username !== '' && room !== '') {
        const users = rooms.get(room).get("users");
        users.delete(username);
        for (const [key, value] of users) {
            value.send(JSON.stringify({ username: username, type: "info", detail: "leave" }));
        }
        console.log("DISC ["+room+"] User \""+username+"\" disconnected");
    }
    ws.close();
}

function roomJoinAndCreation(username, ws, roomName) {
    let room = rooms.get(roomName);
    if (room === undefined) {
        rooms.set(roomName, new Map([["users", new Map()], ["msg", []]]));
        room = rooms.get(roomName);
    }
    const users = room.get("users");
    users.set(username, ws);
}

function handleMessage(username, room, msgData) {
    const chatRoom = rooms.get(room);
    const msg = JSON.parse(msgData).data;
    if (chatRoom !== undefined) {
        const users = chatRoom.get("users");
        for (const [key, value] of users) {
            value.send(JSON.stringify({ username: username, type: "msg", data: msg, timestamp: new Date().toLocaleString() }));
        }
        console.log("MSGE ["+room+"] User \""+username+"\" sent a message");
    }
}

function sendLogged(ws, message) {
    // ALL MESSAGES BEING SENT MUST BE PASS THERE HERE
    // Exception: WHEN new user join, SEND type:info to all to users @ room; LOG "JOIN ["+room+"] User \""+username+"\" connected"
    // Exception: WHEN new messages, SEND type:info to all to users @ room; LOG "MSGE ["+room+"] User \""+username+"\" sent a message"
    // Exception: WHEN user disconnects, SEND type:msg to all to users @ room; LOG "DISC ["+room+"] User \""+username+"\" disconnected"
    console.log("Sending:", message);
    ws.send(JSON.stringify(message));
}