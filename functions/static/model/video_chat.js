const functions = require('firebase-functions');
const dao = require('./dao.js');
const matching = require('./matching.js')
const roomDemo = require('./room_demo.js');
const rooms = require('./rooms.js');

// start
exports.twoVideoChatPrepare = async(offer, userId) => {
    // check room_demo.length
    const numberOfRoomDemo = await dao.selectAll('room_demo');

    if(Array.isArray(numberOfRoomDemo)){
        if(numberOfRoomDemo.length == 1){
            // not exist roomDemo
            // create roomDemo
            roomDemo.setRoomDemo(userId, offer, 0);

            // save roomDemo
            const roomDemoResult = dao.saveWithId('room_demo', userId, roomDemo.getRoomDemo());

            if(roomDemoResult.hasOwnProperty(err)){
                // has error
                return {err: err};
            }

            // listen Create in matching
            functions.firestore.document('matching/{matchingId}').onCreate((snap, context) => {
                // get member's userId
                const memberId = context.params.matchingId;

                const updateResult = await dao.saveWithId('matching', memberId, {hostUserId: userId});

                if(updateResult.hasOwnProperty(err)){
                    // has error
                    return {err: err};
                }
            });

            // listen Update room_demo
            functions.firestore.document(`room_demo/${userId}`).onUpdate((change, context) => {
                // get answer
                const newRoomDemo = change.after.data();

                const answer = newRoomDemo.answer;

                rooms.setRoom(offer, answer);

                const roomResult = dao.saveWithId('rooms', userId, rooms.getRoom());

                if(roomResult.hasOwnProperty(err)){
                    // has error
                    return {err: err};
                }
            });

            // TODO: start chat?
            return 'you are host';
        }else if(numberOfRoomDemo.length > 1){
            // exist roomDemo
            matching.setMatching('member', offer);

            // listen Update matching
            functions.firestore.document(`matching/${userId}`).onUpdate((change, context) => {
                // get hostUserId
                const newMatching = change.after.data();

                hostUserId = newMatching.hostUserId;
            });

            return hostUserId;
        }else{
            // ?
            console.log('???');
            return {err: 'has error'};
        }
    }else{
        // numberOfRoomDemo has error
        return numberOfRoomDemo;
    }
}

// case : 'you are host'         case : hostUserId
//   room exist                    member : make answer
//   start? or wait?                        insert roomDemo
//                                 host : listen roomDemo toUpdate
exports.memberPrepare = async(answer, hostUserId) => {
    // insert roomDemo

    // return error or success
}

exports.startVideoChat = async() => {
    // return ?
}

exports.endVideoChat = async() => {
    // return ?
}


// room.length == 0                                            room.length != 0
// create offer                                                create offer
// create roomDemo                                             create matching

// listen matching(onCreate)

// if set xxx(uid){auth : 'member'}
//     update xxx(uid){auth : 'member',hostUserId : yyy(uid)}

//                                                             listen matching(onUpdate)

//                                                             if update xxx(uid){auth : 'member', hostUserId : yyy(uid)}
//                                                                 create answer
//                                                                 update roomDemo

// listen rooms_demo(onUpdate)

// if numberOfMember >= maxMember-1 start or wait
//     case start
//         create rooms by roomdemo's data

//     case wait
