const admin = require('firebase-admin');

let db = admin.firestore();

// video chat prepare for two people
function twoVideoChatPrepare(userId){
  const numberOfRoomDemo = db.collection('room_demo').get().then(snapshot => {
    let userIds = [];
    snapshot.forEach(doc => {
      userIds.push(doc.id);
    })

    // return to numberOfRoomDemo
    return userIds;
  }).catch(err => {
    return {err : err};
  })

  if(Array.isArray(numberOfRoomDemo)){
    // create matching
    const matching = {
      userId : userId
    };
  
    // insert matching to db
    const matchingRef = await db.collection('matchingn').doc(userId).set(matching);
  
    if(numberOfRoomDemo.length == 0){
      // create room_demo
      const roomDemoRef = db.collection('room_demo').doc(userId).set(matching);

      // listen for create my matching
      // and update document


      // listen for update my room_demo


      // create room


      // return 'host', userId or insert these to DOM


    }else if(numberOfRoomDemo.length >= 1){
      // insert to anyone's matching


      // listen for update my matching document
      // get hostUserId


      // return 'member', hostUserId or insert these to DOM

      
    }else{
      // ????????????
    }
  }else{
    // has error
    // return to camera page
    return numberOfRoomDemo;
  }

}

// TODO: think about necessary of peerConnection on here