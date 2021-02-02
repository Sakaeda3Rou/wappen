const db = firebase.firestore();

// video chat prepare for two people
async function twoVideoChatPrepare(userId){
  // create nextValRef
  const nextValRef = db.collection('next_numbers').doc('forMatching');
  try{
    // transaction for get and update nextVal
    const myVal = await db.runTransaction(async t => {
      // get nextVal
      const doc = t.get(nextValRef);
      const nextVal = doc.data().nextVal;

      // increment and update nextVal
      await t.update(nextValRef, {nextVal : nextVal + 1});

      // return nextVal
      return nextVal;
    })
  }catch(err){
    // has error
    return {err : err};
  }
  
  // create matching
  const matching = {
    userId : userId,
    number : myVal
  };
  
  await db.collection('matching').doc(userId).set(matching);
  const roomDemoData = null;
  
  if(myVal % 2 == 1){
    // create room_demo
    roomDemoData = db.collection('room_demo').doc(userId).set({host : matching});

    // get calleeId
    const calleeId = db.collection('matching').orderBy('number', 'desc').startAfter(myVal).limit(1).get().then(snapshot => {
      // create resultArray
      let resultArray = [];

      if(snapshot.empty){
        return resultArray;
      }

      snapshot.forEach(doc => {
        // push userId
        resultArray.push(doc.data().userId);
      })

      // return to calleeId
      return resultArray;
    }).catch(err => {
      // has error
      return {err : err};
    })

    if(Array.isArray(calleeId)){
      try{
        // update callee's matching
        await db.collection('matching').doc(calleeId[0]).update({hostUserId : userId});

        const hostName = await db.collection('user_detail').doc(userId).get().then(doc => {
          if(!doc.exists){
            return '';
          }

          return doc.data().userName;
        })

        const memberName = await db.collection('user_detail').doc(calleeId[0]).get().then(doc => {
          if(!doc.exists){
            return '';
          }

          return doc.data().userName;
        })

        // +---------------------------+
        // | return to video chat page |
        // +---------------------------+
        return {hostUserId : userId, auth : 'host', hostName : hostName, memberName : memberName};
      }catch(err){
        // has error
        return {err : err};
      }
    }else{
      // error in create calleeId
      return calleeId;
    }
  }else{
    // get host's userId
    // listen update for my matching
    const hostUserId = db.collection('matching').doc(userId).onSnapshot(snapshot => {
      snapshot.docChanges().forEach(change => {
        if(change.type === 'modified'){
          // return hostUserId
          return change.doc.data().hostUserId;
        }
      })
    })

    // create roomDemoRef
    const roomDemoRef = db.collection('room_demo').doc(hostUserId);

    try{
      // update room_demo
      roomDemoData = await roomDemoRef.update({member : matching});

      const hostName = await db.collection('user_detail').doc(hostUserId).get().then(doc => {
        if(!doc.exists){
          return '';
        }

        return doc.data().userName;
      })

      const memberName = await db.collection('user_detail').doc(userId).get().then(doc => {
        if(!doc.exists){
          return '';
        }

        return doc.data().userName;
      })

      // +---------------------------+
      // | return to video chat page |
      // +---------------------------+ 
      return {hostUserId : hostUserId, auth : 'member', hostName : hostName, memberName : memberName};
    }catch(err){
      // has error
      return {err : err};
    }
  }
}

// TODO: think about necessary of peerConnection on here