const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
mongoose.plugin(slug);
const userSchema = new mongoose.Schema({
    idSocket: {
        type: String, required: false
    },
    avatar: { type: String, required: false },
    name: {
        type: String,
        required: true,
        min: 6,
        max: 255,
    },
    slug: { type: String, slug: "name" },
    email: {
        type: String,
        required: true,
        min: 6,
        max: 255,
    },
    password: {
        type: String,
        required: true,
        max: 1024,
        min: 6,
    },
    token: {
        type: String,
        required: false,
    },
    status: {
        type: String,
        required: false,
        default: "offline",
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
})

module.exports = mongoose.model('User', userSchema);