const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    const token = req.header('auth-token');
    if (!token) {
        return res.status(400).send('Access Denied');
    }

    try {
        const secretKey = process.env.TOKEN_SECRET;
        const verified = jwt.verify(token, secretKey); // If error happens while verify then jump to catch function
        req.user = verified;
        // Call function next
        next();
    }
    catch (err) {
        res.status(400).send('Invalid Token');
    }
}