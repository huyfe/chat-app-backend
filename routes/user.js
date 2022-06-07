const router = require('express').Router(); // import router to generate routes
const User = require('../model/User'); // import model User
const verify = require('./verifyToken'); // import middleware verify auth

// GET ALL USERS 
router.get('/all', verify, async (req, res) => {
    const allUsers = await User.find();

    const data = allUsers.map((user) => {
        return {
            id: user._id,
            fullName: user.name,
            slug: user.slug || null,
            email: user.email,
            status: user.status || null,
        }
    })
    res.status(200).send(data);
});

/*
* GET ALL USERS ONLINE
*/
router.get('/users-online', verify, async (req, res) => {
    const idUser = req.user._id;
    const allUsers = await User.find(
        { status: 'online' }
    );
    const data = allUsers.map((user) => {
        return {
            id: user._id,
            fullName: user.name,
            slug: user.slug || null,
            email: user.email,
            status: user.status || null,
            avatar: user.avatar || null,
        }
    })
    res.status(200).send(data);
});


module.exports = router;