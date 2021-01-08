const admin = require('firebase-admin');
const functions = require('firebase-functions');

let db = admin.firestore();

// video chat prepare for two people
function twoVideoChatPrepare(userId){
  const numberOfRoomDemo = db.collection('room_demo').get().then(snapshot => {
    let rows = 0;
    snapshot.forEach(doc => {
      rows = rows + 1;
    })

    // return to numberOfRoomDemo
    return rows;
  })

  if(numberOfRoomDemo == 0){
    // create roomdemo
  }else if(numberOfRoomDemo >= 1){
    // create maching
  }else{
    // ????????????
  }
}
