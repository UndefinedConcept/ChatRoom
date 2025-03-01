// public/client.js

const socket = io();
const params = new URLSearchParams(window.location.search);
if (!params.has('room') || !params.has('username') || Object.keys(params.get('username')).length === 0) {
    const errorUrl = new URL("/", window.location.origin);
    errorUrl.searchParams.append('error', encodeURIComponent("Undefined Room and/or Username"));
    window.location.href = errorUrl; 
}
const room = params.get('room');
const username = params.get('username');

document.title = `Chat Room: ${room}`;
console.log("[" + room + "] " + username + "joined");
// Check if parameters are present
socket.emit('joinRoom', { user: username, room });

function validateInputs(username, room) {
    return username.trim() !== '' && room.trim() !== ''; // Check for non-empty values
}

const messagesDiv = document.getElementById('messages');
const usersDiv = document.getElementById('users');
const typingDiv = document.getElementById('typing');

socket.on('error', ({ url, error }) => {
    // Append error message to the URL as a parameter
    const errorUrl = new URL(url, window.location.origin);
    errorUrl.searchParams.append('error', encodeURIComponent(error));
    window.location.href = errorUrl; // Redirect to the homepage with error message
});

socket.on('loadMessages', (messages) => {
    messages.forEach(msg => {
        addMessage(msg);
    });
});

socket.on('message', (data) => {
    addMessage(data);
});

socket.on('updateUsers', (users) => {
    usersDiv.innerHTML = 'Users: ' + users.join(', ');
});

socket.on('typing', (user) => {
    typingDiv.innerHTML = `${user} is typing...`;
    setTimeout(() => {
        typingDiv.innerHTML = '';
    }, 1000);
});

socket.on('userJoined', (user) => {
    addMessage({ timestamp: new Date().toLocaleString(), username: 'System', message: `${user} has joined the chat.` });
});

socket.on('userLeft', (user) => {
    addMessage({ timestamp: new Date().toLocaleString(), username: 'System', message: `${user} has left the chat.` });
});

// Handle key presses in the message input
document.getElementById('message-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault(); // Prevent the default action (new line)
        sendMessage(); // Send the message
    }
});

// Function to send message
function sendMessage() {
    const messageInput = document.getElementById('message-input');
    const message = messageInput.value;

    if (message) {
        socket.emit('newMessage', message);
        messageInput.value = ''; // Clear input after sending
    }
}

document.getElementById('message-input').oninput = () => {
    socket.emit('typing', username);
};

function addMessage(data) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('msg');
    messageElement.innerHTML = `[${data.timestamp}] ${data.username}: ${formatMessage(data.message)}`; // Allow HTML rendering for formatting
    messagesDiv.appendChild(messageElement);
    window.scrollTo(0, document.body.scrollHeight);
}

// Function to format messages with basic HTML tags
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