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

// Config env 
dotenv.config();

// Connect to database mongodb
mongoose.connect(process.env.DB_CONNECT, () => console.log('connected to db'));


// Socket io set up
const server = http.createServer(app);
const io = socketIO(server, {
    transports: ['polling'],
    cors: {
        cors: {
            origin: "http://localhost:8080",
            credentials: true,
        }
    }
})

const usersOnline = [];
io.on('connection', socket => {
    console.log('A new user has connected: ');
    // console.log(socket.rooms); // Set { <socket.id> }
    // socket.join("room1");
    // console.log(socket.rooms); // Set { <socket.id>, "room1" }

    socket.emit("general", "You has connected to server socket");

    // List users is online 
    socket.on("usersOnline", (idUser) => {
        if (!usersOnline.find(id => id === idUser)) {
            const user = {
                idSocket: socket.id,
                idUser: idUser
            }
            usersOnline.push(user);
            io.emit("usersOnline", usersOnline);
            console.log("List users online", usersOnline);
        }

    })

    socket.on("disconnect", (reason) => {
        console.log("A user has disconnected: ", socket.id);
        const userIndex = usersOnline.findIndex((user) => user.idSocket === socket.id);
        if (userIndex !== -1) {
            usersOnline.splice(userIndex, 1);
        }
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