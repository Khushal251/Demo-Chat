const http = require("http");
const express = require("express");
const cors = require("cors");
const socketIO = require("socket.io");

const app = express();
const port = 4500 || process.env.PORT;

const users = [];

app.use(cors());
app.get("/", (req, res) => {
    res.send("Hello, it's working");
});

const server = http.createServer(app);
const io = socketIO(server);

io.on("connection", (socket) => {
    console.log("New Connection");

    socket.on('joined', ({ user }) => {
        users.push({ id: socket.id, name: user });
        console.log(`${user} has joined`);
        socket.broadcast.emit('userJoined', { user: "Admin", message: `${user} has joined` });
        socket.emit('welcome', { user: "Admin", message: `Welcome to the chat ${user}` });
    });

    socket.on('message',({message,id})=>{
        const user = users.find(u => u.id === id);
        if (user) {
            io.emit('sendMessage', { user: user.name, message, id });
        }
    });

    socket.on('disconnect', () => {
        console.log("User left");
        const userIndex = users.findIndex(u => u.id === socket.id);
        if (userIndex !== -1) {
            const user = users[userIndex].name;
            socket.broadcast.emit('leave', { user: "Admin", message: `${user} has left` });
            users.splice(userIndex, 1); // Remove the user from the array
        }
    });
});

server.listen(port, () => {
    console.log(`Server is working on http://localhost:${port}`);
});
