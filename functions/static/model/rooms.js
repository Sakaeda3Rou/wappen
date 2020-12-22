const roomId = null;
const room = {
    offer : null,
    answer : null
}

exports.setRoomId = (roomId) => {
    this.roomId = roomId;
}

exports.setRoom = (offer, answer) => {
    room.offer = offer;
    room.answer = answer;
}

exports.getRoomId = () => {
    return this.roomId;
}

exports.getRoom = () => {
    return room;
}