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
    let resultArray = [];
    if(snapshot.empty){
      // no document
      return null;
    }else{
      snapshot.forEach(doc => {
        resultArray.push(doc.data());
      })

      // return to result
      return resultArray;
    }
  }).catch(err => {
    // has error
    return {err: err};
  })

  // return to controller
  return result;
}

// need collection's name as 'collectionName',
//      docuentId as 'id',
exports.selectDocById = async (collectionName, id) => {
  // get document
  const res = await db.collection(collectionName).doc(id).get().then(doc => {
    if(!doc.exists){
      // no document
      return null;
    }else{
      // return result
      return doc.data();
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
// NB: when select shared object
//     operator = 'array-contains-any'
//     word is array ex:['kawaii', 'kimoi']
exports.selectDocOneColumn = async(collectionName, columnName, operator, word) => {
  // get document with select
  const res = await db.collection(collectionName).where(columnName, operator, word).get().then(snapshot => {
    let resultArray = [];
    if(snapshot.empty){
      // no document
      console.log('empty');
      return null;
    }else{
      // return result
      console.log(`snapshot => ${snapshot}`);
      snapshot.forEach(doc => {
        resultArray.push(doc.data());
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

  // make result array
  let returnArray = [];

  // first sellection
  const first = await firstRef.where(idName, '==', id).get().then(snapshot => {
    if(snapshot.empty){
      return null;
    }
    // NB: three pattern i think
    if(idName == 'userId'){
      snapshot.forEach(doc => {
        const second = secondRef.doc(doc.clanId).get().then(doc => {
          returnArray.push(doc.data());
        }).catch(err => {
          return {err: err};
        })
      })
    }else if(idName == 'clanId'){
      snapshot.forEach(doc => {
        const second = secondRef.doc(doc.userId).get().then(doc => {
          returnArray.push(doc.data());
        }).catch(err => {
          return {err: err};
        })
      })
    }else{
      snapshot.forEach(doc => {
        const second = secondRef.doc(doc.objectId).get().then(doc => {
          returnArray.push(doc.data());
        }).catch(err => {
          return {err: err};
        })
      })
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
      return null;
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

    // return to first
    return {result: success};
  }).catch(err => {
    return {err: err};
  })

  // return to controller
  return first;
}

// when you use : for search clan
// need word for use to search as 'searchword'
exports.searchClan = async(searchWord) => {
  const clan = await db.collection('clan').where('searchClanName', 'array-contains', searchWord).where('numberOfMember', '<', '20').get().then(snapshot => {

  })
}

// when you use : for increment numberOfAdd
// need object's id as 'objectId'
exports.incrementNumberOfAdd = async(objectId) => {
  const res = await db.collection('object').doc(objectId).update({
    numberOfAdd: admin.firestore.fieldValue.increment(1)
  });

  return res;
}
