const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
mongoose.plugin(slug);

/* 
* Sub schema of messages array
*/
const message = new mongoose.Schema({
    text: {
        type: String,
        default: null,
    },
    time: {
        type: Date,
        default: new Date(),
    },
    isRead: {
        type: Boolean,
        default: false,
    }
})

/* 
* Sub Schema of messagesData array
*/
const messageSchema = new mongoose.Schema({
    idUser: {
        type: String,
        required: false,
        default: null,
    },
    messages: {
        type: [message],
        default: undefined,
    }
})

/*
* Sub Schema of members array 
*/
const member = new mongoose.Schema({
    idMember: {
        type: String,
        required: true,
    },
    idSocket: {
        type: String,
        required: false,
        default: null,
    },
    avatar: {
        type: String,
        required: false,
        default: null,
    },
    fullName: {
        type: String,
        required: true,
        default: null,
    },
    isTyping: {
        type: Boolean,
        required: false,
        default: false,
    },
    isJoining: {
        type: Boolean,
        required: false,
        default: false,
    },
    slug: { type: String, slug: "fullName" },
})

/* 
* Main Schema
*/
const roomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false,
        min: 6,
        max: 255,
    },
    slug: { type: String, slug: "name" },
    type: {
        type: String,
        required: true,
        default: "friend",
    },
    members: {
        type: [member],
        default: undefined,
    },
    messagesData: {
        type: [messageSchema],
        default: undefined,
    },
    createdAt: {
        type: Date,
        default: new Date(),
    },
    updatedAt: {
        type: Date,
        default: new Date(),
    },

})

module.exports = mongoose.model('Room', roomSchema);