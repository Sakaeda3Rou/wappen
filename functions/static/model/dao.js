var _this = this;
const admin = require('firebase-admin');
const functions = require('firebase-functions');


let db = admin.firestore();

// need collection's name as 'collectionName',
//      documentId as 'id',
//      data for save as 'data'
exports.saveWithId = async(collectionName, id, data) => {
  // save collection with ID
  try{
    const res = await db.collection(collectionName).doc(id).set(data);

    // return to controller
    return res;
  }catch(err){
    return {err: err};
  }

}

// need collection's name as 'collectionName',
//      data for save as 'data'
exports.saveWithoutId = async(collectionName, data) => {
  // save collection without ID
  try{
    const res = await db.collection(collectionName).add(data);

    // return to controller
    return res;
  }catch(err){
    return {err: err};
  }

}

// need collection's name as 'collectionName',
//      documentId as 'id',
//      data for save as 'data'
exports.updateDoc = async(collectionName, id, data) => {
  // update document
  try{
    const res = await db.collection(collectionName).doc(id).update(data);

    // return to controller
    return res;
  }catch(err){
    return {err: err};
  }
}

// need collection's name as 'collectionName',
//      documentId as 'id',
exports.deleteDoc = async(collectionName, id) => {
  // delete document
  try{
    const res = await db.collection(collectionName).doc(id).delete();

    // return to controller
    return res;
  }catch(err){
    return {err: err};
  }

}

// when you use : select all document in collection
// need collection's name as 'collectionName'
exports.selectAll = async (collectionName) => {
  const result = await db.collection(collectionName).get().then(snapshot => {
    // create result array
    let resultArray = [];

    if(snapshot.empty){
      // no document
      return resultArray;
    }else{
      snapshot.forEach(doc => {
        let data = {id : doc.id};
        let document = doc.data();
        for(const key in document){
          data[key] = document[key];
        }
        resultArray.push(data);
      })

      // return to result
      return resultArray;
    }
  }).catch(err => {
    // has error
    return {err: err};
  });

  // return to controller
  return result;
}

// need collection's name as 'collectionName',
//      docuentId as 'id',
exports.selectDocById = async (collectionName, id) => {
  // get document
  const res = await db.collection(collectionName).doc(id).get().then(doc => {
    // create result array
    let resultArray = [];

    if(!doc.exists){
      // no document
      return resultArray;
    }else{
      // return result
      resultArray.push(doc.data());
      return resultArray;
    }
  }).catch(err => {
    // error
    // NB: if(xxx.hasOwnProperty(err)){}
    return {err: err};
  });

  // return to controller
  return res
}

// need collection's name as 'collectionName',
//      column's name as 'columnName',
//      operator for select as 'operator' (ex : "=="),
//      word for select as 'word'
//      number of pages as 'page' (ex : 0(non limit), 1, 2, ...)
// NB: when select shared object
//     operator = 'array-contains-any'
//     word is array ex:['kawaii', 'kimoi']
exports.selectDocOneColumn = async(collectionName, columnName, operator, word, page) => {
  // get document with select
  const res = await db.collection(collectionName).where(columnName, operator, word).get().then(snapshot => {
    // create result array
    let resultArray = [];

    if(snapshot.empty){
      // no document
      // console.log('empty');
      return resultArray;
    }else{
      // return result
      // console.log(`snapshot => ${snapshot}`);
      snapshot.forEach(doc => {
        let data = {id : doc.id};
        let document = doc.data();
        for(const key in document){
          data[key] = document[key];
        }
        resultArray.push(data);
      })
      return resultArray;
    }
  }).catch(err => {
    // error
    // NB: if(xxx.hasOwnProperty(err)){}
    return {err: err};
  });

  return res;
}

// when you use : select double table (ex: my_object and object)
// need user's Id as 'userId',
//      first collection's name as 'firstCollectionName',
//      second collection's name as 'firstColectionName'
// NB: return result by array
exports.selectDoubleTable = async(userId, firstCollectionName, secondCollectionName) => {
  const firstRef = db.collection(firstCollectionName);
  const secondRef = db.collection(secondCollectionName);

  // first sellection
  const first = await firstRef.where('userId', '==', userId).get().then(snapshot => {
    // make result array
    let returnArray = [];

    if(snapshot.empty){
      return returnArray;
    }

    snapshot.forEach(doc => {
      let document = doc.data();
      let data = null;
      if(firstCollectionName == 'containment_to_clan' && secondCollectionName == 'clan'){
        data = document.clanId;
      }else if(firstCollectionName == 'my_object' && secondCollectionName == 'object'){
        data = document.objectId;
      }else{
        // ???????????
      }
      returnArray.push(data);
    })

    return returnArray;
  }).catch(err => {
    return {err: err};
  });

  if(Array.isArray(first)){
    const second = await secondRef.where(admin.firestore.FieldPath.documentId(), 'in', first).get().then(snapshot => {
      let returnArray = [];

      if(snapshot.empty){
        return returnArray
      }

      snapshot.forEach(doc => {
        let data = null;
        if(firstCollectionName == 'containment_to_clan' && secondCollectionName == 'clan'){
          data = {clanId: doc.id};
        }else if(firstCollectionName == 'my_object' && secondCollectionName == 'object'){
          data = {objectId: doc.id};
        }else{
          // ????????????
        }
        let document = doc.data();
        for(const key in document){
          data[key] = document[key];
        }
        resultArray.push(data);
      })

      return returnArray;
    }).catch(err => {
      return {err: err};
    })

    //return to controller
    return second;
  }else{
    return first;
  }
}

// when you use : select markerURL and objectURL
// need user's id as userId
//      clan's id as clanId
exports.selectMarkerList = async(userId, clanId) => {
  // create path to document
  const containmentToClanRef = db.collection('containment_to_clan');
  const userDetailRef = db.collection('user_detail');
  const myObjectRef = db.collection('my_object');
  const objectRef = db.collection('object');

  // select clan from containment_to_clan by clanId
  const userIdList = await containmentToClanRef.where('clanId', '==', clanId).get().then(snapshot => {
    // create return array
    let returnArray = [];

    if(snapshot.empty){
      return returnArray;
    }

    snapshot.forEach(doc => {
      const containmentToClanData = doc.data();
      returnArray.push(containmentToClanData.userId);
    })

    // return to userIdList
    return returnArray;
  }).catch(err => {
    // has error
    return {err: err};
  })

  if(Array.isArray(userIdList)){
    // select userDetail from user_detail by userIdList
    const userDetailList = await userDetailRef.where('userId', 'array-contains', userIdList).get().then(snapshot => {
      let returnArray = [];

      if(snapshot.empty){
        return returnArray;
      }

      snapshot.forEach(doc => {
        const userDetailData = doc.data();
        returnArray.push({userId: doc.id, markerURL: userDetailData.markerURL});
      })

      // return to userDetailList
      return returnArray;
    }).catch(err => {
      // has error
      return {err: err};
    })

    const myObjectList = await myObjectRef.where('userId', 'array-contains', userIdList).where('isSelected', '==', true).get().then(snapshot => {
      let returnArray = [];

      if(snapshot.empty){
        return returnArray;
      }

      snapshot.forEach(doc => {
        const myObjectData = doc.data();
        returnArray.push(myObjectData);
      })

      // return to myObjectList
      return returnArray;
    }).catch(err => {
      // has error
      return {err: err};
    })

    if(Array.isArray(myObjectList) && Array.isArray(userDetailList)){
      // create markerList
      let markerList = [];
      //create flag for discover same userId
      let flag = false;
      for(const myObject of myObjectList){
        const object = await objectRef.doc(myObject.objectId).get().then(doc => {

          return doc.data();
        }).catch(err => {
          return {err: err};
        })

        if(object.hasOwnProperty('err')){
          // has error
          // return to controller
          console.log(`error in make object : ${object.err}`);
          return object;
        }else{
          // loop userDetailList
          for(let i = 0; i < userDetailList.length && flag == false; i++){
            let userDetail = userDetailList[i];
            if(userDetail.userId == myObject.userId){
              flag = true;
              if(userDetail.userId == userId && myObject.userId == userId){
                markerList.unshift({userId: userId, userName: userDetail.userName, markerURL: userDetail.markerURL, objectURL: object.objectURL});
              }else{
                markerList.push({userId: userDetail.userId, userName: userDetail.userName, markerURL: userDetail.markerURL, objectURL: object.objectURL});
              }
            }
          }
          // reset flag
          flag = false;
        }
      }

      // return to controller
      console.log('success');
      return markerList;
    }else if(!Array.isArray(userDetailList)){
      // has error
      // return to controller
      console.log(`error in make userDetailList : ${userDetailList.err}`);
      return userDetailList;
    }else if(!Array.isArray(myObjectList)){
      // has error
      // return to controller
      console.log(`error in make myObjectList : ${myObjectList.err}`);
      return myObjectList;
    }else{
      // ?????
      console.log('error');
    }
  }else{
    // has error
    // return to controller
    console.log(`error in make userIdList : ${userIdList.err}`);
    return userIdList;
  }
}

// when you use : change status 'isSelected'
// need user's id as userId
//      object's id what you want to change status to true as 'newObjectId'
exports.changeSelected = async(userId, newObjectId) => {
  const myObjectRef = db.collection('my_object');

  // select object's id what you want to change status to false
  const first = await myObjectRef.where('userId', '==', userId).where('isSelected', '==', true).get().then(snapshot => {
    if(snapshot.empty){
      return {result: null};
    }
    snapshot.forEach(doc => {
      // change status to false
      const second = _this.updateDoc('my_object', doc.id, {isSelected: false});
      if(second.hasOwnProperty('err')){
        return {err: second.err};
      }
    })
    const third = myObjectRef.where('userId', '==', userId).where('objectId', '==', newObjectId).get().then(snapshot => {
      snapshot.forEach(doc => {
        // change status to true
        const four = _this.updateDoc('my_object', doc.id, {isSelected: true});
        if(four.hasOwnProperty('err')){
          return {err: four.err};
        }
      })
    }).catch(err => {
      return {err: err};
    })

    if(third.hasOwnProperty('err')){
      return {err: err};
    }

    // return to first
    return {result: success};
  }).catch(err => {
    return {err: err};
  })

  if(first.hasOwnProperty('err')){
    return {err: err};
  }

  // return to controller
  return first;
}

// when you use : for search clan
// need word for use to search as 'searchword'
//      user's id as 'userId'
exports.searchClan = async(searchWord, userId) => {
  const userClan = await db.collection('containment_to_clan').where('userId', '==', userId).get().then(snapshot => {
    // create array
    let resultArray = [];

    if(snapshot.empty){
      // no document
      return resultArray;
    }

    snapshot.forEach(doc => {
      // console.log(`clanId => ${doc.data()}`);
      const document = doc.data();
      resultArray.push(document.clanId);
    })

    //return to userClan
    // console.log(`userClan => ${resultArray}`);
    return resultArray;
  }).catch(err => {
    // has error
    return {err : err};
  });

  if(Array.isArray(userClan)){
    const clan = await db.collection('clan').where('searchClanName', 'array-contains', searchWord).where('numberOfMember', '<', 20).get().then(snapshot => {
      // create array
      let resultArray = [];

      if(snapshot.empty){
        // no document
        return resultArray;
      }

      snapshot.forEach(doc => {
        // judge containment
        var flag = false;

        for(var i = 0; i < userClan.length && flag == false; i++){
          // console.log(`userClan[${i}] => ${userClan[i]}`);
          if(doc.id == userClan[i]){
            flag = true;
          }
        }

        if(flag != true){
          let data = {id : doc.id};
          let document = doc.data();
          for(const key in document){
            data[key] = document[key];
          }

          resultArray.push(data);
        }
      })

      // return to clan
      return resultArray;
    }).catch(err => {
      // has error
      return {err : err};
    });

    // return to controller
    // console.log(`clan => ${clan}`);
    return clan;
  }else{
    return userClan;
  }

}

// when you use : select boject
// need category as 'category' (ex: ['kawaii', 'kimoi'])
//      last object's id as 'objectId'
//      user's id as 'userId'
exports.searchObject = async(category, userId, objectId) => {
  // select user's object
  const userObject = await db.collection('my_object').where('userId', '==', userId).where('isShared', '==', true).get.then(snapshot => {
    // create result array
    let resultArray = [];

    if(snapshot.empty){
      // no document
      return resultArray;
    }

    snapshot.forEach(doc => {
      var document = doc.data()
      resultArray.push(document.objectId);
    })
  }).catch(err => {
    return {err: err}
  })

  if(Array.isArray(userObject)){
    // judge page number
    if(!objectId){
      // page 0
      const object = await db.collection('object').where('category', 'array-contains', category).limit(20).get.then(snapshot => {
        // create array
        let resultArray = [];

        if(snapshot.empty){
          // no document
          return resultArray;
        }

        snapshot.forEach(doc => {
          // judge containment
          var flag = false;

          for(var i = 0; i < userObject.length && flag == false; i++){
            // console.log(`userClan[${i}] => ${userClan[i]}`);
            if(doc.id == userObject[i]){
              flag = true;
            }
          }

          if(flag != true){
            let data = {id : doc.id};
            let document = doc.data();
            for(const key in document){
              data[key] = document[key];
            }

            resultArray.push(data);
          }
        })

        // return to object
        return resultArray;
      }).catch(err => {
        return {err: err};
      })

      return object;
    }else{
      // page 2 to n
      const object = await db.collection('object')
                             .where('category', 'array-contains', category)
                             .orderBy(admin.firestore.FieldPath.documentId())
                             .startAfter(objectId)
                             .limit(20).get.then(snapshot => {
        // create array
        let resultArray = [];

        if(snapshot.empty){
          // no document
          return resultArray;
        }

        snapshot.forEach(doc => {
          // judge containment
          var flag = false;

          for(var i = 0; i < userObject.length && flag == false; i++){
            // console.log(`userClan[${i}] => ${userClan[i]}`);
            if(doc.id == userObject[i]){
              flag = true;
            }
          }

          if(flag != true){
            let data = {id : doc.id};
            let document = doc.data();
            for(const key in document){
              data[key] = document[key];
            }

            resultArray.push(data);
          }
        })

        // return to object
        return resultArray;
      }).catch(err => {
        return {err: err};
      })

    }

    // return to controller
    return object;
  }else{
    return userObject;
  }
}

// when you use : for increment numberOfAdd
// need object's id as 'objectId'
exports.incrementNumberOfAdd = async(objectId) => {
  const res = await db.collection('object').doc(objectId).update({
    numberOfAdd: admin.firestore.fieldValue.increment(1)
  });

  return res;
}

// when you use : for increment numberOfMember
// need clan's id as 'clanId'
exports.incrementNumberOfMember = async(clanId) => {
  const res = await db.collection('clan').doc(clanId).update({
    numberOfMember: admin.firestore.fieldValue.increment(1)
  });

  return res;
}

// when you use : for increment numberOfMember
// need clan's id as 'clanId'
exports.decrementNumberOfMember = async(clanId) => {
  const res = await db.collection('clan').doc(clanId).update({
    numberOfMember: admin.firestore.fieldValue.increment(-1)
  });

  return res;
}
