const router = require('express').Router();
const User = require('../model/User');
const { registerValidation, loginValidation } = require('../validation');

router.post('/register', async (req, res) => {
    // Validation
    const { error } = registerValidation(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    // Create a user belong User model
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
    });
    try {
        const savedUser = await user.save(); // Save register user into collection users
        res.send({ message: 'Registered successfully', data: savedUser }); // Send to client message successfully
    }
    catch (err) {
        res.status(400).send(err); // Send to client error status and message
    }
});

module.exports = router; // Export in order that index.js can use