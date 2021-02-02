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
  
  await db.collection('matching').doc(myVal).set(matching);
  let roomDemoData = null;
  let roomId = null;
  
  if(myVal % 2 == 0){
    // +------+
    // | host |
    // +------+

    roomId = String(myVal);

    try{
      // create room_demo
      roomDemoData = await db.collection('room_demo').doc(roomId).set({host : matching});
    }catch(err){
      // has error
      return {err : err};
    }

    return {roomId : roomId, auth : 'host'};
  }else{
    // +--------+
    // | member |
    // +--------+

    roomId = String(myVal - 1);

    try{
      // join room_demo
      roomDemoData = await db.collection('room_demo').doc(roomId).set({member : matching});
    }catch(err){
      // has error
      return {err : err};
    }

    return {roomId : roomId, auth : 'member'};
  }
}

// TODO: think about necessary of peerConnection on here