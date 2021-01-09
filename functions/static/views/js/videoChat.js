const admin = require('firebase-admin');

let db = admin.firestore();

// default configuration
const configuration = {
  iceServers: [
    {
      urls: [
        'stun:stun1.l.google.com:19302',
        'stun:stun2.l.google.com:19302',
      ],
    },
  ],
  iceCandidatePoolSize: 10,
};

let peerConnection = null;
let localStream = null;
let remoteStream = null;
let roomDialog = null;

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
    // create peerConnection
    peerConnection = new RTCPeerConnection(configuration);
  
    registerPeerConnectionListeners();
  
    // create offer
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
  
    const matching = {
      userId : userId,
      offer : {
        type : offer.type,
        sdp : offer.sdp
      }
    };
  
    // insert matching to db
    const matchingRef = await db.collection('matchingn').doc(userId).set(matching);
  
    if(numberOfRoomDemo.length == 0){
      // create room_demo
      const roomDemoRef = db.collection('room_demo').doc(userId).set(matching);

      // listen for create my matching
      // and update document


      // listen for update my room_demo


      // 
    }else if(numberOfRoomDemo.length >= 1){
      // insert to anyone's matching

      // listen for update my matching document

      // insert answer to host's room_demo 
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