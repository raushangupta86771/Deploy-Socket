const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);

const port = process.env.PORT || 8900;

// create socket io instance
const io = socketIo(server, {
  cors: {
    origin: ["https://funny-gecko-10a63a.netlify.app", "http://localhost:3000"],
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});

let users = [];

const addUser = (userId, socketId) => {
  //if userId is there in users[] then keep it else add it
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (receiverId) => {
  return users.find((user) => user.userId === receiverId);
};

// listen for connection event
io.on("connection", (socket) => {
  console.log(`New client connected: ${socket.id}`);

  // listen for addUser event
  socket.on("addUser", (userId) => {
    console.log(`User ${userId} connected with socket id ${socket.id}`);
    addUser(userId, socket.id);
    io.emit("getUsers", users);
  });

  // listen for sendMessage event
  socket.on("sendMessage", ({ senderId, receiverId, text }) => {
    const user = getUser(receiverId);
    if (!user) {
      console.log(`User ${receiverId} is not connected to the socket`);
      return;
    }

    console.log(`Sending message from ${senderId} to ${receiverId}: ${text}`);
    io.to(user.socketId).emit("getMessage", {
      senderId,
      text
    });
  });

  // listen for disconnection event
  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
    removeUser(socket.id);
    io.emit("getUsers", users);
  });
});

server.listen(port, () => {
  console.log(`Socket server running on port ${port}`);
});
