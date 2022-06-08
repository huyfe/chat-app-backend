const express = require('express');
const app = express();
const cors = require('cors');
const http = require('http');
const socketIO = require("socket.io");


// Mongoose
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Import Routes
const authRoute = require('./routes/auth');
const postRoute = require('./routes/categories');
const userRoute = require('./routes/user');
const roomRoute = require('./routes/room');

const User = require('./model/User'); // import model User

// Import utils 
// const userUtil = require('./utils/users');
const { userOnline, userOffline, getCurrentUser, getAllUsersOnline, userJoinRoom, userLeave } = require('./utils/users');


// Config env 
dotenv.config();

// Connect to database mongodb
mongoose.connect(process.env.DB_CONNECT, () => console.log('connected to db'));


// Socket io set up
const server = http.createServer(app);
const io = socketIO(server, {
    transports: ["polling", "websocket"],
    cors: {
        cors: {
            origin: "http://localhost:8080",
            credentials: true,
        }
    },
    maxHttpBufferSize: 1e8, pingTimeout: 60000

})

io.on('connection', socket => {
    console.log('A new user has connected: ');

    socket.on('joinRoom', ({ idUser, room }) => {
        const user = userJoinRoom(idUser, socket.id, room);
        socket.join(user.room);
        console.log("A user has joined the room: ", user.room);
        // Broadcast when a user join room 
        socket.broadcast.to(user.room).emit("room", { message: "Your friend has joined the room" });
    });

    socket.on('leaveRoom', ({ idUser }) => {
        userLeave(idUser);
    })

    socket.on('chatMessage', async (message) => {
        const user = getCurrentUser(socket.id);
        socket.broadcast.to(user.room).emit("message", { message, idRoom: user.room });
        // console.log(message);
    })

    socket.emit("general", "You has connected to server socket");

    // Listening users online emit 
    socket.on("usersOnline", async (idUser) => {
        await userOnline(idUser, socket.id);
        const usersOnlineListData = await getAllUsersOnline();
        io.emit("usersOnline", usersOnlineListData);
    })

    // Listening users disconnected
    socket.on("disconnect", async (reason) => {
        console.log("A user has disconnected: ", socket.id);
        await userOffline(socket.id);
        const usersOnlineListData = await getAllUsersOnline();
        io.emit("usersOnline", usersOnlineListData);
    });
})

app.set('socketio', io); // Set to use io object in every express route

// Middleware
app.use(express.json());
app.use(cors({
    credentials: true,
    origin: true,

}));

// Route Middlewares
app.use('/api/auth', authRoute);
app.use('/api/posts', postRoute);
app.use('/api/users', userRoute);
app.use('/api/rooms', roomRoute);

const port = process.env.PORT;

server.listen(port, () => console.log("Server Up and running "))