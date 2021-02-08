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

// insert canvas to localStream
let localStream = null;

// first insert MediaStream()
// at peerConnection add EventListener to 'stream' for reinsert stream
let remoteStream = null;

let roomDialog = null;

let roomId = null;

const db = firebase.firestore();

// if auth is 'host'
async function createRoom(roomId){
  this.roomId = roomId;
  const roomRef = await db.collection('rooms').doc(roomId);

  // create peerConnection with configuration
  peerConnection = new RTCPeerConnection(configuration);

  registerPeerConnectionListeners();

  // localStream add to peerConnection
  localStream.getTracks().forEach(track => {
    peerConnection.addTrack(track, localStream);
  });

  const callerCandidatesCollection = roomRef.collection('callerCandidates');

  // listen my icecandidate
  // if it has change candidate add collection
  peerConnection.addEventListener('icecandidate', event => {
    if(!event.candidate){
      return ;
    }
    callerCandidatesCollection.add(event.candidate.toJSON());
  });

  // create offer and set localdescription
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);

  const roomWithOffer = {
    'offer' : {
      type : offer.type,
      sdp : offer.sdp
    }
  };

  // offer add to rooms
  await roomRef.set(roomWithOffer);

  // listen track
  // if remoteStream has change add to my stream
  peerConnection.addEventListener('track', event => {
    event.streams[0].getTracks().forEach(track => {
      remoteStream.addTrack(track);
    });
  });

  // listen room
  // if create answer it set to remoteDescription
  roomRef.onSnapshot(async snapshot => {
    const data = snapshot.data();
    if(!peerConnection.currentRemoteDescription && data && data.answer){
      const rtcSessionDescription = new RTCSessionDescription(data.answer);
      await peerConnection.setRemoteDescription(rtcSessionDescription);
    }
  });

  // listen anyone icecandidate
  // if it has change candidate add peerconnection
  roomRef.collection('calleeCandidates').onSnapshot(snapshot => {
    snapshot.docChanges().forEach(async change => {
      if(change.type === 'added'){
        let data = change.doc.data();

        await peerConnection.addIceCandidate(new RTCIceCandidate(data));
      }
    });
  });
}

// if auth is 'member'
async function joinRoomById(roomId){
  this.roomId = roomId;
  const roomRef = db.collection('rooms').doc(roomId);
  const roomSnapshot = await roomRef.get();

  if(roomSnapshot.exists){
    // create peerconnection with configuration
    peerConnection = new RTCPeerConnection(configuration);

    registerPeerConnectionListeners();

    // localstream add to peerConnection
    localStream.getTracks().forEach(track => {
      peerConnection.addTrack(track, localStream);
    });
    
    // listen my icecandidate
    // if it has change candidate add to collection
    const calleeCandidatesCollection = roomRef.collection('calleeCandidates');
    peerConnection.addEventListener('icecandidate', event => {
      if(!event.candidate){
        return ;
      }
      calleeCandidatesCollection.add(event.cadidate.toJSON());
    });
    
    // listen remotestream
    // if it has change track add to stream
    peerConnection.addEventListener('track', event => {
      event.streams[0].getTracks().forEach(track => {
        remoteStream.addTrack(track);
      });
    });
    
    // get offer from room and create answer
    const offer = roomSnapshot.data().offer;
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    
    const roomWithAnswer = {
      'answer' : {
        type : answer.type,
        sdp : answer.sdp
      }
    };
    
    // answer add to rooms
    await roomRef.update(roomWithAnswer);
    
    // listen anyone icecandidate
    // if it has change candidate add to peerconnection
    roomRef.collection('callerCandidates').onSnapshot(snapshot => {
      snapshot.docChanges().forEach(async change => {
        if(change.type === 'added'){
          let data = change.doc.data();
          
          await peerConnection.addIceCandidate(new RTCIceCandidate(data));
        }
      });
    });
  }
}

// get userMedia and AR to localStream
// use micFlag and videoFlag to get userMedia
async function openUserMedia(videoFlag, micFlag){
  const stream = await navigator.mediaDevices.getUserMedia({video : videoFlag, audio : micFlag});
  document.querySelector('#localVideo').srcObject = stream;
  localStream = stream;
  remoteStream = new MediaStream();
  document.querySelector('#remoteVideo').srcObject = remoteStream;
}

// hangup
async function hangUp(e) {
  const tracks = document.querySelector('#localVideo').srcObject.getTracks();
  tracks.forEach(track => {
    track.stop();
  });

  if (remoteStream) {
    remoteStream.getTracks().forEach(track => track.stop());
  }

  if (peerConnection) {
    peerConnection.close();
  }

  document.querySelector('#localVideo').srcObject = null;
  document.querySelector('#remoteVideo').srcObject = null;

  // Delete room on hangup
  if (roomId) {
    const roomRef = db.collection('rooms').doc(roomId);
    const calleeCandidates = await roomRef.collection('calleeCandidates').get();
    calleeCandidates.forEach(async candidate => {
      await candidate.delete();
    });
    const callerCandidates = await roomRef.collection('callerCandidates').get();
    callerCandidates.forEach(async candidate => {
      await candidate.delete();
    });
    await roomRef.delete();
  }

  document.location.reload(true);
}

function registerPeerConnectionListeners() {
  peerConnection.addEventListener('icegatheringstatechange', () => {
    console.log(
        `ICE gathering state changed: ${peerConnection.iceGatheringState}`);
  });

  peerConnection.addEventListener('connectionstatechange', () => {
    console.log(`Connection state change: ${peerConnection.connectionState}`);
  });

  peerConnection.addEventListener('signalingstatechange', () => {
    console.log(`Signaling state change: ${peerConnection.signalingState}`);
  });

  peerConnection.addEventListener('iceconnectionstatechange ', () => {
    console.log(
        `ICE connection state change: ${peerConnection.iceConnectionState}`);
  });
}