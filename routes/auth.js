const router = require('express').Router();
const User = require('../model/User');

const Joi = require('joi');

const schema = Joi.object({
    name: Joi.string().min(6).required(),
    email: Joi.string().min(6).required().email(),
    password: Joi.string().min(6).required()
})

router.post('/register', async (req, res) => {
    try {
        const validation = await schema.validateAsync(req.body);

        const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
        })

        const savedUser = await user.save();

        res.status(200).send({ message: 'Registered successfully', data: savedUser });
    }
    catch (err) {
        res.status(400).send(err.details[0].message);
    }
});


module.exports = router;