const express = require('express');
const app = express();
const cors = require('cors');

const mongoose = require('mongoose');
const dotenv = require('dotenv');
// Import Routes
const authRoute = require('./routes/auth');

dotenv.config();

// Connect to database mongodb
mongoose.connect(process.env.DB_CONNECT, () => console.log('connected to db'));

// Middleware
app.use(express.json());
app.use(cors());

// Route Middlewares
app.use('/api/user', authRoute)

app.listen(3000, () => console.log("Server Up and running "))