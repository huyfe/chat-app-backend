const express = require('express');
const app = express();
const cors = require('cors');

// Config socket io 
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);
app.set('socketio', io); // Set to use io object in every express route

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

// Middleware
app.use(express.json());
app.use(cors());

// Route Middlewares
app.use('/api/auth', authRoute);
app.use('/api/posts', postRoute);
app.use('/api/users', userRoute);
app.use('/api/rooms', roomRoute);

app.listen(3000, () => console.log("Server Up and running "))