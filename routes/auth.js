const router = require('express').Router();

router.post('/register', (req, res) => {
    console.log("API Register is working");
    res.send('Register');
})


module.exports = router;