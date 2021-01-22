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

const admin = require('firebase-admin');

let db = admin.firestore();

async function videoActive(auth, hostUserId){
    // create peerConnection
    peerConnection = new RTCPeerConnection(configuration);
  
    registerPeerConnectionListeners();
    
    const roomRef = db.collection('rooms').doc(hostUserId);
    const roomSnapshot = await roomRef.get();

    if(roomSnapshot.exists){
      if(auth == 'host'){
        // create offer
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);

        // insert offer to roomRef
        await roomRef.add({offer : {type : offer.type, sdp : offer.sdp}});

        // get localStream and add Tracks to peerConnection
        localStream.getTracks().forEach(track => {
          peerConnection.addTrack(track, localStream);
        })

        // create caller ICE candidates
        const callerCandidatesCollection = roomRef.collection('callerCandidates');

        // add EventListener to peerConnection for find ICE difference
        peerConnection.addEventListener('icecandidate', event => {
          if(!event.candidate){
            return;
          }

          // insert callerCandidatesCollection
          callerCandidatesCollection.add(event.candidate.toJSON());
        });

        // add EventListener to listen remoteStream
        peerConnection.addEventListener('track', event => {
          // get remoteStream
          event.streams[0].getTracks().forEach(track => {
            // insert remoteStream
            remoteStream.addTrack(track);
          })
        })

        // listen roomRef to get answer
        roomRef.onSnapshot(async snapshot => {
          const data = snapshot.data();
          if(!peerConnection.currentRemoteDescription && data.answer){
            const answer = new RTCSessionDescription(data.answer);
            await peerConnection.setRemoteDescription(answer);
          }
        });

        // listen to calleeCandidates(remote ICE candidates)
        roomRef.collection('calleeCandidates').onSnapshot(snapshot => {
          snapshot.docChanges().forEach(async change => {
            if(change.type === 'added'){
              let data = change.doc.data();

              await peerConnection.addIceCandidate(new RTCIceCandidate(data));
            }
          });
        });
      }else if(auth == 'member'){
        // listen roomRef
        // get localstream for addTrack
        localStream.getTracks().forEach(track => {
          peerConnection.addTrack(track, localStream);
        });

        // create calleeCandidatesCollection and insert
        const calleeCandidatesCollection = roomRef.collection('calleeCandidates');

        peerConnection.addEventListener('icecandidate', event => {
          if(!event.candidate){
            return;
          }

          // insert
          calleeCandidatesCollection.add(event.candidate.toJSON());
        });

        // get offer to create answer
        const offer = roomSnapshot.data().offer;

        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

        const answer = await peerConnection.createAnswer();

        await peerConnection.setLocalDescription(answer);

        await roomRef.add({answer : {type : answer.type, sdp : answer.sdp}});

        // listen callerCandidatesCollection and update
        roomRef.collection('callerCandidates').onSnapshot(snapshot => {
          snapshot.docChanges().forEach(async change => {
            if(change.type === 'added'){
              let data = change.doc.data();

              await peerConnection.addIceCandidate(new RTCIceCandidate(data));
            }
          })
        })
      }else{
        // ??????????        
      }
    }else{
      // ??????????
    }
}

// get userMedia and AR to localStream
// use micFlag and videoFlag to get userMedia
async function openUserMedia(arStream){
  const stream = await navigator.mediaDevices.getUserMedia({video : videoFlag, audio : micFlag});
  document.querySelector('#localVideo').srcObject = stream;
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
  document.querySelector('#cameraBtn').disabled = false;
  document.querySelector('#joinBtn').disabled = true;
  document.querySelector('#createBtn').disabled = true;
  document.querySelector('#hangupBtn').disabled = true;
  document.querySelector('#currentRoom').innerText = '';

  // Delete room on hangup
  if (roomId) {
    const db = firebase.firestore();
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