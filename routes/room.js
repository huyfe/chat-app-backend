const router = require('express').Router(); // import router to generate routes
const Room = require('../model/Room'); // import model Room
const User = require('../model/User'); // import model Room
const verify = require('./verifyToken'); // import middleware verify auth
const moment = require('moment');
/*
* GET ALL MY ROOM
*/
router.get('/me', verify, async (req, res) => {
    const idClient = req.user._id;

    try {
        const roomListByIdClient = await Room.find({ "members.idMember": idClient });

        // Return slug, avatar, fullName of friend 
        // Return last time of the chat, last text of the chat
        const roomListByIdUserCustom = roomListByIdClient.filter(room => room.messagesData.length > 0).map(room => {
            let slug = "";
            let avatar = "";
            let fullName = "";
            let lastTime = "";
            let lastText = "";
            let isRead = false;
            let idUser = "";

            room.members.forEach((member, index) => {

                if (member.idMember !== idClient) {
                    slug = member.slug;
                    avatar = member.avatar;
                    fullName = member.fullName;

                    idUser = member.idMember;
                    return;
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
            if (room.messagesData.length > 0) {
                const lastMessagesData =
                    room.messagesData[room.messagesData.length - 1];

                if (lastMessagesData.idUser !== idUser) {
                    room.messagesData[room.messagesData.length - 1].messages[room.messagesData[room.messagesData.length - 1].messages.length - 1].isRead = true;
                }
            }

            return room.save();
        })
        .then((room) => {
            res.status(200).send(room);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({ meesage: "Data not found", code: "ERR_NOT_FOUND" });
        })
});

/*
* CREATE ROOM 
*/
router.post('/create', verify, async (req, res) => {
    const idClient = req.user._id;
    const idFriend = req.body.idFriend;

    const client = await User.findById(idClient);
    const friend = await User.findById(idFriend);

    const room = new Room();
    room.members = [{ idMember: idClient, fullName: client.name }, { idMember: idFriend, fullName: friend.name }];
    room.messagesData = []

    try {
        const newRoom = await room.save();
        if (newRoom) {
            console.log("New room: ", newRoom);
            res.status(200).send(newRoom);
        }
    }
    catch (err) {
        res.status(404).send({ message: err });
        console.log(err);
    }
})

/*
* FIND ROOM OF CLIENT AND FRIEND
*/
router.get('/find/:idFriend', verify, async (req, res) => {
    const idFriend = req.params.idFriend;
    const idClient = req.user._id;

    // const roomDetail = await Room.find({ "members.idMember": { $all: [idFriend, idClient] } }).exec();
    const roomDetail = await Room.findOne().all('members.idMember', [idFriend, idClient]);
    if (roomDetail) {
        res.status(200).send(roomDetail);
    }
    else {
        res.status(404).send({ message: 'Room not found' });
    }
})

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
            const lastMessagesData = room.messagesData.length &&
                room.messagesData[room.messagesData.length - 1];
            const lastMessage = room.messagesData.length &&
                lastMessagesData.messages[lastMessagesData.messages.length - 1];

            // Get time of text message and compare with current time
            var date1 = moment(lastMessage.time);
            var date2 = moment(new Date());
            const differenceInMs = date2.diff(date1); // diff yields milliseconds
            const duration = moment.duration(differenceInMs); // moment.duration accepts ms
            const differenceInMinutes = duration.asMinutes(); // if you would like to have the output 559
            const minuteLimit = 5; // Limit 5 minutes

            // Nếu tin nhắn cuối là của user gửi lên
            if (room.messagesData.length) {
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
            }

            if (!room.messagesData.length || lastMessagesData.idUser !== idUser) {
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
            res.status(400).send("Send message failed")
        });
})

module.exports = router;