const router = require('express').Router(); // import router to generate routes
const Room = require('../model/Room'); // import model Room
const verify = require('./verifyToken'); // import middleware verify auth
const moment = require('moment');
/*
* GET ALL MY ROOM
*/
router.get('/me', verify, async (req, res) => {
    const idUser = req.user._id;
    try {
        const roomListByIdUser = await Room.find({ "members.idMember": idUser }).exec();

        // Return slug, avatar, fullName of friend 
        // Return last time of the chat, last text of the chat
        const roomListByIdUserCustom = roomListByIdUser.map(room => {
            let slug = "";
            let avatar = "";
            let fullName = "";
            let lastTime = "";
            let lastText = "";
            let isRead = false;
            let idUser = "";

            room.members.forEach((member, index) => {
                if (member.idMember !== idUser) {
                    slug = member.slug;
                    avatar = member.avatar;
                    fullName = member.fullName;
                    idUser = member.idMember;
                }
            })

            // Get last time of message of messagesData of room 
            const lastMessages = room.messagesData[room.messagesData.length - 1]; // get last item of array
            const lastMessage = lastMessages.messages[lastMessages.messages.length - 1]; // get last item of array
            lastTime = lastMessage.time;
            lastText = lastMessage.text;
            isRead = lastMessage.isRead;
            const result = {
                id: room._id,
                idUser,
                slug,
                avatar,
                fullName,
                lastTime,
                lastText,
                isRead,
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


    // If get detail then last message is read 
    Room.findById(idRoom)
        .then((room) => {
            if (!room) {
                throw new Error("Data not found");
            }
            if (!room.members.filter(member => member.idMember === idUser)) {
                throw new Error("Access denied");
            }
            const lastMessagesData =
                room.messagesData[room.messagesData.length - 1];

            if (lastMessagesData.idUser !== idUser) {
                room.messagesData[room.messagesData.length - 1].messages[room.messagesData[room.messagesData.length - 1].messages.length - 1].isRead = true;
            }

            return room.save();
        })
        .then((room) => {
            res.status(200).send(room);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({ meesage: err });
        })


    // try {
    //     const roomDetail = await Room.findOne({ _id: idRoom }).exec();
    //     if (!roomDetail) {
    //         throw new Error("Data not found");
    //     }
    //     if (!roomDetail.members.filter(member => member.idMember === idUser)) {
    //         throw new Error("Access denied");
    //     }

    //     res.status(200).send(roomDetail);
    // }
    // catch (err) {
    //     res.status(500).send({ meesage: "Data not found" });
    // }
});

/*
* POST MESSAGESDATA
*/
router.post('/send-messages/:id', verify, async (req, res) => {
    const idUser = req.user._id;
    const idRoom = req.params.id;
    const text = req.body.textMessage;

    Room.findById(idRoom)
        .then((room) => {
            // Nếu tin nhắn cuối cùng là của mình và thời gian của tin nhắn cuối cùng so sánh với
            // thời gian hiện tại không quá 5 phút thì sẽ push tin nhắn vào property messages (room.messagesData.messages)
            const lastMessagesData =
                room.messagesData[room.messagesData.length - 1];
            const lastMessage =
                lastMessagesData.messages[lastMessagesData.messages.length - 1];

            // Get time of text message and compare with current time
            var date1 = moment(lastMessage.time);
            var date2 = moment(new Date());
            const differenceInMs = date2.diff(date1); // diff yields milliseconds
            const duration = moment.duration(differenceInMs); // moment.duration accepts ms
            const differenceInMinutes = duration.asMinutes(); // if you would like to have the output 559
            const minuteLimit = 5; // Limit 5 minutes

            // Nếu tin nhắn cuối là của user gửi lên
            if (lastMessagesData.idUser === idUser) {
                if (differenceInMinutes > minuteLimit) {
                    // Create messageData data to push into room.messagesData array
                    const messageData = {
                        idUser: idUser,
                        messages: [
                            {
                                text: text,
                                time: new Date(),
                                isReply: false,
                            },
                        ],
                    };

                    // Push new messageData into room.messagesData array
                    room.messagesData.push(messageData);
                } else {
                    // Create textMessage data to push into room.messagesData.messages array
                    const textMessage = {
                        text: text,
                        time: new Date(),
                        isReply: false,
                    };
                    room.messagesData[
                        room.messagesData.length - 1
                    ].messages.push(textMessage);
                }
            }

            if (lastMessagesData.idUser !== idUser) {
                // Create messageData data to push into room.messagesData array
                const messageData = {
                    idUser: idUser,
                    messages: [
                        {
                            text: text,
                            time: new Date(),
                            isReply: false,
                        },
                    ],
                };

                // Push new messageData into room.messagesData array
                room.messagesData.push(messageData);
            }
            return room.save();
        })
        .then((room) => {
            res.status(200).send(room.messagesData);
        })
        .catch(e => {
            res.status(400).send(e)
        });
})

module.exports = router;