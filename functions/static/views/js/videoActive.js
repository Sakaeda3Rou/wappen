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

const admin = require('firebase-admin');

let db = admin.firestore();

async function videoActive(auth, hostUserId){
    // create peerConnection
    peerConnection = new RTCPeerConnection(configuration);
  
    registerPeerConnectionListeners();
  
    // create offer
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    
    const roomRef = db.collection('rooms').doc(hostUserId);
    const roomSnapshot = await roomRef.get();

    if(roomSnapshot.exists){
        if(auth == 'host'){
            // create offer


        }else{
            // listen roomRef
            // create answer

            
        }
    }else{
        // ??????????
    }
}