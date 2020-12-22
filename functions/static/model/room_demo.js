const userId = null;
const roomDemo = {
    numberOfMember : null
}

// NB: roomDemo final form
//     roomDemo : {
//             xxx(uid) : {
//                 auth : host
//                 offer : {
//                     type : offer.type,
//                     sdp : offer.sdp
//                 }
//             },
//             yyy(uid) : {
//                 auth : member
//                 answer : {
//                     type : answer.type,
//                     sdp : answer.sdp
//                 }
//             },
//             numberOfMember : 2
// }

exports.setUserId = (userId) => {
    this.userId = userId;
}

exports.setRoomDemo = (uid, offer, numberOfMember) => {
    roomDemo[uid] = {
        auth : 'host',
        offer : offer
    }
    roomDemo.numberOfMember = numberOfMember;
}

exports.addMember = (userId, answer) => {
    roomDemo[userId] = {
        auth : 'member',
        answer : answer
    };
}

exports.getUserId = () => {
    return this.userId;
}

exports.getRoomDemo = () => {
    return roomDemo;
}