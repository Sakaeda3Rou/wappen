async function twoVideoChatPrepare(userId){
  // create nextValRef
  const nextValRef = db.collection('next_numbers').doc('forMatching');
  let myVal = null;
  try{
      // transaction for get and update nextVal
      myVal = await db.runTransaction(async (t) => {
          // get nextVal
          const doc = await t.get(nextValRef);
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
  await db.collection('matching').doc(String(myVal)).set(matching);
  let roomDemoData = null;
  let roomId = null;
  let hostId = null;
  let memberId = null;
  let hostName = null;
  let memberName = null;
  let flag = false;
  if(myVal % 2 == 0){
      // +---------------------------------+
      // |              host               |
      // +---------------------------------+
      roomId = String(myVal);
      hostId = userId;
      try{
          // create room_demo
          roomDemoData = await db.collection('room_demo').doc(roomId).set({host : matching});
          hostName = await db.collection('user_detail').doc(hostId).get().then(doc => {
              if(!doc.exists){
                  return '';
              }
              return doc.data().userName;
          })
          // create listener
          const listener = db.collection('room_demo').doc(roomId).onSnapshot(async snapshot => {
              const data = snapshot.data();
              if(data.member){
                  memberId = data.member.userId;
                  flag = true;
              }
          })
          while(flag == false){
              // 1s = 1000
              await sleep(3000);
              console.log('!!!retry!!!');
          }
          memberName = await db.collection('user_detail').doc(memberId).get().then(doc => {
              if(!doc.exists){
                  return '';
              }
              return doc.data().userName;
          })
      }catch(err){
          // has error
          return {err : err};
      }
      // return to page
      return {roomId : roomId, auth : 'host', hostName : hostName, memberName : memberName};
  }else{
      // +--------------------------------+
      // |             member             |
      // +--------------------------------+
      // create roomId
      roomId = String(myVal - 1);
      memberId = userId;
      try{
          // join room_demo
          roomDemoData = await db.collection('room_demo').doc(roomId).update({member : matching});
          memberName = await db.collection('user_detail').doc(memberId).get().then(doc => {
              if(!doc.exists){
                  return '';
              }
              return doc.data().userName;
          })
          hostId = await db.collection('room_demo').doc(roomId).get().then(doc => {
              if(!doc.exists){
                  return '';
              }
              return doc.data().host.userId;
          })
          hostName = await db.collection('user_detail').doc(hostId).get().then(doc => {
              if(!doc.exists){
                  return '';
              }
              return doc.data().userName;
          })
      }catch(err){
          // has error
          return {err : err};
      }
      // return to page
      return {roomId : roomId, auth : 'member', hostName : hostName, memberName : memberName};
  }
}

function sleep(msec) {
  return new Promise(function(resolve) {           
      setTimeout(function() {resolve()}, msec);
  })
}