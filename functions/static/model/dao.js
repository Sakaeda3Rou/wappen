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
// need first collection's xxId (ex: userId, clanId) as 'id',
//      first collection's id name (ex: 'userId') as 'idName',
//      first collection's name as 'firstCollectionName',
//      second collection's name as 'firstColectionName'
// NB: return result by array
exports.selectDoubleTable = async(id, idName, firstCollectionName, secondCollectionName) => {
  const firstRef = db.collection(firstCollectionName);
  const secondRef = db.collection(secondCollectionName);

  // first sellection
  const first = await firstRef.where(idName, '==', id).get().then(snapshot => {
    // make result array
    let returnArray = [];

    if(snapshot.empty){
      return returnArray;
    }
    // NB: three pattern i think
    if(firstCollectionName == 'containment_to_clan' && secondCollectionName == 'clan'){
      snapshot.forEach(containmentToClan => {
        const second = secondRef.doc(containmentToClan.clanId).get().then(doc => {
          let data = {clanId : doc.id, containmentToClanId : containmentToClan.id};
          let document = doc.data();
          for(const key in document){
            data[key] = document[key];
          }
          returnArray.push(data);
        }).catch(err => {
          return {err: err};
        })
      })
    }else if(firstCollectionName == 'containment_to_clan' && secondCollectionName == 'user'){
      snapshot.forEach(containmentToClan => {
        const clan = containmentToClan.data();
        const second = secondRef.doc(containmentToClan.userId).get().then(doc => {
          let data = {userId : doc.id, clanId : clan.clanId};
          let document = doc.data();
          for(const key in document){
            data[key] = document[key];
          }
          returnArray.push(data);
        }).catch(err => {
          return {err: err};
        })
      })
    }else if(firstCollectionName == 'my_object' && secondCollectionName == 'object'){
      snapshot.forEach(myObject => {
        const second = secondRef.doc(myObject.objectId).get().then(doc => {
          let data = {objectId : doc.id, myObjectId : myObject.id};
          let document = doc.data();
          for(const key in document){
            data[key] = document[key];
          }
          returnArray.push(data);
        }).catch(err => {
          return {err: err};
        })
      })
    }else{
      // didn't think
    }

    // return to first
    return returnArray;
  }).catch(err => {
    return {err: err};
  });

  //return to controller
  return first;
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
      if(second.hasOwnProperty(err)){
        return {err: second.err};
      }
    })
    const third = myObjectRef.where('userId', '==', userId).where('objectId', '==', newObjectId).get().then(snapshot => {
      snapshot.forEach(doc => {
        // change status to true
        const four = _this.updateDoc('my_object', doc.id, {isSelected: true});
        if(four.hasOwnProperty(err)){
          return {err: four.err};
        }
      })
    }).catch(err => {
      return {err: err};
    })

    if(third.hasOwnProperty(err)){
      return {err: err};
    }

    // return to first
    return {result: success};
  }).catch(err => {
    return {err: err};
  })

  if(first.hasOwnProperty(err)){
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
