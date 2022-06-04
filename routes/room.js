const router = require('express').Router(); // import router to generate routes
const Room = require('../model/Room'); // import model Room
const verify = require('./verifyToken'); // import middleware verify auth

/*
* GET ALL MY ROOM
*/
router.get('/me', verify, async (req, res) => {
    const idUser = req.user._id;
    try {
        const roomListByIdUser = await Room.find({ idMember: idUser }).exec();

        // Return slug, avatar, fullName of friend 
        // Return last time of the chat, last text of the chat
        const roomListByIdUserCustom = roomListByIdUser.map(room => {
            let slug = "";
            let avatar = "";
            let fullName = "";
            let lastTime = "";
            let lastText = "";

            room.members.forEach((member, index) => {
                if (member.idMember !== idUser) {
                    slug = member.slug;
                    avatar = member.avatar;
                    fullName = member.fullName;
                }
            })

            // Get last time of message of messagesData of room 
            const lastMessages = room.messagesData[room.messagesData.length - 1]; // get last item of array
            const lastMessage = lastMessages.messages[lastMessages.messages.length - 1]; // get last item of array
            lastTime = lastMessage.time;
            lastText = lastMessage.text;

            const result = {
                id: room._id,
                slug,
                avatar,
                fullName,
                lastTime,
                lastText,
                status: "online",
            }

            return result;
        })
        res.status(200).send(roomListByIdUserCustom);
    }
    catch {
        res.status(404).send({ message: "Your rooms are not found" });
    }
});

/*
* GET ROOM DETAIL 
*/
router.get('/:id', verify, async (req, res) => {
    const idUser = req.user._id;
    const idRoom = req.params.id;
    try {
        const roomDetail = await Room.findOne({ _id: idRoom }).exec();
        if (!roomDetail) {
            throw new Error("Data not found");
        }
        if (!roomDetail.members.filter(member => member.idMember === idUser)) {
            throw new Error("Access denied");
        }
        res.status(200).send(roomDetail);
    }
    catch (err) {
        res.status(500).send({ meesage: "Data not found" });
    }
});

module.exports = router;