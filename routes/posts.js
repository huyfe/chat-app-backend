const router = require('express').Router();

// Import middleware verify auth
const verify = require('./verifyToken');


router.get('', verify, (req, res) => {
    res.send(req.user);
    // res.json({
    //     posts: {
    //         title: 'my first post', description: 'random data you shoudnt  access'
    //     }
    // })
})

module.exports = router; // Export in order that index.js can use