const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = createServer(app);
const io = new Server(server);

// Serve static files from the "public" folder
app.use(express.static(path.resolve("./public")));

// Route to serve the chat page
app.get('/', (req, res) => {
    res.sendFile(path.resolve("./public/index.html"));
});

// Store userId -> socket.id mapping
const users = {};

// When a user connects
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Register user with a unique ID
    socket.on("register", (userId) => {
        users[userId] = socket.id;
        console.log(`User registered: ${userId} -> ${socket.id}`);
    });
    console.log(users);
    

    // Handle private messages
    socket.on("privateMessage", ({ senderId, receiverId, message }) => {
        const receiverSocketId = users[receiverId];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("messageReceived", { senderId, message });
        } else {
            console.log(`User ${receiverId} not found.`);
        }
        console.log("receiverSocketId is : ",receiverSocketId);
        
    });

    // Remove user from mapping when they disconnect
    socket.on("disconnect", () => {
        Object.keys(users).forEach(userId => {
            if (users[userId] === socket.id) {
                delete users[userId];
                console.log(`User ${userId} disconnected.`);
            }
        });
    });
});

// Start the server on port 3000
server.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});
