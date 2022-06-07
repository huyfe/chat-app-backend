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
    // console.log(socket.rooms); // Set { <socket.id> }
    // socket.join("room1");
    // console.log(socket.rooms); // Set { <socket.id>, "room1" }

    socket.emit("general", "You has connected to server socket");
    // Listening users emit 
    socket.on("usersOnline", async (idUser) => {
        const findAndUpdate = await User.findOneAndUpdate({ _id: idUser },
            { status: 'online', idSocket: socket.id }
        );
        console.log("Id socket user: ", findAndUpdate);
        const usersOnlineListData = await User.find(
            { status: 'online' }
        );
        const data = usersOnlineListData.map((user) => {
            return {
                id: user._id,
                fullName: user.name,
                slug: user.slug || null,
                status: user.status || null,
                avatar: user.avatar || null,
            }
        })
        io.emit("usersOnline", data);
    })

    socket.on("disconnect", async (reason) => {
        console.log("A user has disconnected: ", socket.id);


        const findUser = await User.findOneAndUpdate({ idSocket: socket.id }, { status: 'offline' });

        // console.log("Id socket user: ", findUser.idSocket);
        // console.log("Id socket: ", socket.id);


        const usersOnlineListData = await User.find(
            { status: 'online' }
        );
        const data = usersOnlineListData.map((user) => {
            return {
                id: user._id,
                fullName: user.name,
                slug: user.slug || null,
                status: user.status || null,
                avatar: user.avatar || null,
            }
        })
        io.emit("usersOnline", data);
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