const User = require('../model/User'); // import model User
const Room = require('../model/Room'); // import model User



async function userOnline(id, idSocket) {
    return await User.findOneAndUpdate({ _id: id },
        { status: 'online', idSocket: idSocket }
    );
}

async function userOffline(idSocket) {
    return await User.findOneAndUpdate({ idSocket: idSocket }, { status: 'offline' });
}

async function getAllUsersOnline() {
    const usersOnlineListData = await User.find(
        { status: 'online' }
    );
    const data = usersOnlineListData.map((user) => {
        return {
            id: user._id,
            idSocket: user.idSocket,
            fullName: user.name,
            slug: user.slug || null,
            email: user.email,
            status: user.status || null,
            avatar: user.avatar || null,
        }
    })
    return data;
}



const usersRoom = [];

function getCurrentUser(idSocket) {
    return usersRoom.find(user => user.idSocket === idSocket);
}

function getUsersInRooms() {
    return usersRoom;
}

async function userJoinRoom(idUser, idSocket, room) {
    // const userInRoom = await User.findOneAndUpdate({ "members.idMember": idUser }, { status: 'offline' });
    const userInRoom = await Room.findById(room);
    const indexMember = userInRoom.members.findIndex(member => member.idMember === idUser);
    userInRoom.members[indexMember].idSocket = idSocket;
    userInRoom.members[indexMember].isJoining = true;
    userInRoom.save();

    console.log("User in room when user join room: ", userInRoom.members.find(member => member.idMember === idUser));

    // console.log("User in room when user join room: ", userInRoom.members);

    const user = { id: idUser, idSocket, room };
    usersRoom.push(user);
    return user;
}

async function userLeave(idUser, room) {
    console.log("Room: ", room);
    const userInRoom = await Room.findById(room);
    const indexMember = userInRoom.members.findIndex(member => member.idMember === idUser);
    userInRoom.members[indexMember].idSocket = null;
    userInRoom.members[indexMember].isJoining = false;
    userInRoom.save();

    console.log("User in room when user left room: ", userInRoom.members.find(member => member.idMember === idUser));

    const index = usersRoom.findIndex(user => user.id === idUser);
    if (index !== -1) {
        console.log("Found user left");
        usersRoom.splice(index, 1);
    }
    // return null;
}


module.exports = {
    userOnline,
    userOffline,
    getAllUsersOnline,
    getCurrentUser,
    getUsersInRooms,
    userJoinRoom,
    userLeave,
}