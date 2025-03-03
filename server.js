// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = 3000;

// Rooms and users tracking
const rooms = {
    room1: { users: [], messages: [] },
    room2: { users: [], messages: [] },
};

// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Load index.html for the home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Socket.io connection
io.on('connection', (socket) => {
    let currentRoom = '';
    let username = '';

    // Handle joining room
    socket.on('joinRoom', ({ room, user }) => {
        if (!rooms[room]) {
            socket.emit('error', { url: '/', error: 'Invalid room!' });
            return;
        }
        if (rooms[room].users.includes(user)) {
            socket.emit('error', { url: '/', error: 'Username already taken in this room!' });
            return;
        }

        socket.emit('redirect', { url: "/chat.html?room=" + room + "&username=" + user });
        username = user;
        currentRoom = room;
        
        console.log("[" + currentRoom + "] <" + username + " connected>");
        rooms[room].users.push(user);
        socket.join(room);

        // Send back the message history
        socket.emit('loadMessages', rooms[room].messages);

        // Broadcast new user
        socket.broadcast.to(room).emit('userJoined', user);
        io.to(room).emit('updateUsers', rooms[room].users);
    });

    // Handle new message
    socket.on('newMessage', (msg) => {
        const timestamp = new Date().toLocaleString();
        const messageData = { timestamp, username, message: msg };

        // Save message in room
        rooms[currentRoom].messages.push(messageData);
        io.to(currentRoom).emit('message', messageData);
        console.log("[" + currentRoom + "] " + messageData.username + ": " + messageData.message);
    });

    // Handle typing indicator
    socket.on('typing', () => {
        socket.broadcast.to(currentRoom).emit('typing', username);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        if (currentRoom && username) {
            rooms[currentRoom].users = rooms[currentRoom].users.filter(user => user !== username);
            socket.broadcast.to(currentRoom).emit('userLeft', username);
            io.to(currentRoom).emit('updateUsers', rooms[currentRoom].users);
            console.log("[" + currentRoom + "] <" + username + " disconnected>");
        }
    });
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});