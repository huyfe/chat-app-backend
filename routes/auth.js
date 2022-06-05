const router = require('express').Router();
const User = require('../model/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { registerValidation, loginValidation } = require('../validation');

// REGISTER
router.post('/register', async (req, res) => {
    // Validation
    const { error } = registerValidation(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    // Checking if the user is already in the database
    const emailExist = await User.findOne({ email: req.body.email });
    if (emailExist) {
        return res.status(400).send('Email already exists');
    }

    // Hash password
    const saltRound = 10;
    const salt = await bcrypt.genSalt(saltRound);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Create a user belong User model
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword
    });
    try {
        const savedUser = await user.save(); // Save register user into collection users
        res.send({ message: 'Registered successfully', user: user._id }); // Send to client message successfully
    }
    catch (err) {
        res.status(400).send(err); // Send to client error status and message
    }
});

// LOGIN
router.post('/login', async (req, res) => {

    // Validation
    const { error } = loginValidation(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    // Checking if the email exists
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return res.status(400).send('Email is not found');
    }

    // PASSWORD IS CORRECT
    const validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass) {
        return res.status(400).send('Invalid password');
    }

    // Create and assign a token
    const payload = { _id: user._id };
    const secretKey = process.env.TOKEN_SECRET;
    const token = jwt.sign(payload, secretKey);
    res.header('auth-token', token);

    // Store token into database
    // const updateTokenByEmail = await User.updateOne({ email: req.body.email }, { token: token });
    const updateTokenByEmail = await User.updateOne({ email: req.body.email }, { "$set": { "token": token, "status": "online" } });

    // Socket io 
    // let socket_id = [];
    // const io = req.app.get('socketio');
    // io.on('connection', socket => {
    //     socket_id.push(user.id);
    //     console.log('A new user has connected: ');

    //     // if (socket_id[0] === user.id) {
    //     //     // remove the connection listener for any subsequent 
    //     //     // connections with the same ID
    //     //     io.removeAllListeners('connection');
    //     // }
    //     socket.on('hello message', msg => {
    //         console.log('just got: ', msg);
    //         socket.emit('chat message', 'hi from server');
    //     })
    // })
    // io.on('disconnection', () => {
    //     console.log("A user has left");
    // })

    // Return success response
    res.status(200).send({ message: 'Logged in', profile: { id: user._id, name: user.name, email: user.email, token: token } });
})

// GET PROFILE 
router.post('/profile', async (req, res) => {
    // Checking if the email exists
    const user = await User.findOne({ token: req.body.token });
    if (!user) {
        return res.status(400).send('Token is not equal');
    }
    res.status(200).send({ profile: { id: user._id, name: user.name, email: user.email, token: user.token || "No token" } });
})

module.exports = router; // Export in order that index.js can use