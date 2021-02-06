const db = firebase.firestore();

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
    let anyOneIds = null;
    const myName = await db.collection('user_detail').doc(userId).get().then(doc => {
        if(!doc.exists){
            return '';
        }
        return doc.data().userName;
    }).catch(err => {
        // has error
        return {err : err};
    })
    let flag = false;
    if(myName.hasOwnProperty('err')){
        // has error
        return {err : err};
    }
    if(myVal % 2 == 0){
        // +---------------------------------+
        // |              host               |
        // +---------------------------------+
        roomId = String(myVal);
        try{
            // create room_demo
            roomDemoData = await db.collection('room_demo').doc(roomId).set({host : matching});
            
            // create listener
            const listener = db.collection('room_demo').doc(roomId).onSnapshot(async snapshot => {
                const data = snapshot.data();
                if(data.member){
                    flag = true;
                }
            })
            while(flag == false){
                // 1s = 1000
                await sleep(3000);
                console.log('!!!retry!!!');
            }

            // get member's Id
            anyOneId = await db.collection('room_demo').doc(roomId).get().then(doc => {
                if(!doc.exists){
                    return '';
                }
                return doc.data().member.userId;
            })
        }catch(err){
            // has error
            return {err : err};
        }
        // return to page
        // console.log(`memberName : ${memberName}`);
        return {roomId : roomId, auth : 'host', myName : myName, anyOneIds : [anyOneId]};
    }else{
        // +--------------------------------+
        // |             member             |
        // +--------------------------------+
        // create roomId
        roomId = String(myVal - 1);
        try{
            // join room_demo
            roomDemoData = await db.collection('room_demo').doc(roomId).update({member : matching});

            // get host's userId
            anyOneId = await db.collection('room_demo').doc(roomId).get().then(doc => {
                if(!doc.exists){
                    return '';
                }
                return doc.data().host.userId;
            })
        }catch(err){
            // has error
            return {err : err};
        }
        // return to page
        // console.log(`memberName : ${memberName}`);
        return {roomId : roomId, auth : 'member', myName : myName, anyOneIds : [anyOneId]};
    }
}

function sleep(msec) {
    return new Promise(function(resolve) {           
        setTimeout(function() {resolve()}, msec);
    })
}