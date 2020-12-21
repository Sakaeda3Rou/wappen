// start

// check room_demo.length

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
