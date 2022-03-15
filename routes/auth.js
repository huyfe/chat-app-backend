const router = require('express').Router();
const User = require('../model/User');

router.post('/register', async (req, res) => {
    console.log("API Register is working");
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
    })

    try {
        const savedUser = await user.save();
        res.send(savedUser);
    }

    catch (err) {
        // res.status(400).send(err);
        res.send(err);
        console.log(err);
    }
});


module.exports = router;