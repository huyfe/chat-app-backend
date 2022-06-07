const User = require('../model/User'); // import model User


const usersRoom = [];

async function userOnline(id, idSocket) {
    const findAndUpdate = await User.findOneAndUpdate({ _id: id },
        { status: 'online', idSocket: idSocket }
    );
}

async function userOffline(idSocket) {
    const findUser = await User.findOneAndUpdate({ idSocket: idSocket }, { status: 'offline' });
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

function getCurrentUser(idSocket) {
    return usersRoom.find(user => user.idSocket === idSocket);
}

function userJoinRoom(idUser, idSocket, room) {
    const user = { id: idUser, idSocket, room };
    usersRoom.push(user);
    return user;
}

function userLeave(id) {
    console.log("users room: ", usersRoom);
    const index = usersRoom.findIndex(user => user.id === id);
    if (index !== -1) {
        return usersRoom.splice(index, 1);
    }
    return null;
}


module.exports = {
    userOnline,
    userOffline,
    getAllUsersOnline,
    getCurrentUser,
    userJoinRoom,
    userLeave,
}