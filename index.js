const port = process.env.PORT || 8900;
// console.log(process.env.ORIGIN_REACT_APP)
const io = require('socket.io')(port, {
    cors: {
        origin: process.env.ORIGIN_REACT_APP
    },
})

let users = []

const addUser = (userId, socketId) => {
    //if userId is there in users[] then keep it else add it
    !users.some((user) => user.userId === userId) &&
        users.push({ userId, socketId })
}

const removeUser = (socketId) => {
    users = users.filter(user => user.socketId !== socketId)
}

const getUser = (receiverId) => {
    return users.find((user) => user.userId === receiverId)
}

io.on("connection", (socket) => {

    //when user connected
    console.log("a user connected")
    // io.emit("welcome","hello this is socket server")
    //take userId and socketId from user 
    socket.on("addUser", (userId) => {
        addUser(userId, socket.id)
        io.emit("getUsers", users);
    })

    //send and get message
    socket.on("sendMessage",({senderId,receiverId, text})=>{
        const user = getUser(receiverId);
        console.log(receiverId)
        io.to(user?.socketId).emit("getMessage",{
            senderId,text
        })
    })

    //when user disconnected
    socket.on("disconnect", () => {
        console.log("a user is disconnected");
        removeUser(socket.id);
        io.emit("getUsers", users);
    })
})