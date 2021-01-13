var _this = this;
const admin = require('firebase-admin');

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

// when you use : save object and my_object, object_in_category
// need user's id as 'userId'
//      object's URL as 'objectURL'
//      category's list as 'categoryList'
//      location's X as 'locationX'
//                 Y as 'locationY'
//                 Z as 'locationZ'
//      object's name as 'objectName'
//      can share or not as 'isShared'
exports.saveObject = async(userId, objectURL, categoryList, locationX, locationY, locationZ, isShared, objectName) => {
  // save object
  // create objectData
  const objectData = {
    numberOfAdd : 0,
    objectURL : objectURL,
    isShared : isShared,
    category : categoryList,
    objectName : objectName
  };

  const objectResult = await _this.saveWithoutId('object', objectData);

  if(objectResult.hasOwnProperty('err')){
    return objectResult;
  }

  // save my_object
  // create myObjectData
  const myObjectData = {
    userId : userId,
    objectId : objectResult.id,
    isSelected : true,
    locationX : locationX,
    locationY : locationY,
    locationZ : locationZ
  };

  const myObjectResult = await _this.saveWithoutId('my_object', myObjectData);
  var result = null;
  var objectInCategoryData = null;

  if(myObjectResult.hasOwnProperty('err')){
    return myObjectResult;
  }

  // save object_in_category
  for(const categoryId of categoryList){
    // create objectInCategoryData
    objectInCategoryData ={
      objectId : objectResult.id,
      categoryId : categoryId
    };

    result = await _this.saveWithoutId('object_in_category', objectInCategoryData);
  }

  if(result.hasOwnProperty('err')){
    return result;
  }else{
    return true;
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

// when you use : change 'isShared'
// need object's id as 'objectId',
//      new category as 'category'
exports.updateObject = async(objectId, category) => {
  // update isShared : false -> true
  //        category : old category -> new category
  const updateResult = await _this.updateDoc('object', objectId, {isShared : true, category : category});

  // delete old object_in_category
  const selectResult = await _this.selectDocOneColumn('object_in_category', 'objectId', '==', objectId);

  if(Array.isArray(selectResult)){
    // create delete result
    var deleteResult = null;
    for(const forDelete of selectResult){
      deleteResult = await _this.deleteDoc('object_in_category', forDelete);
    }

    // create update result
    var saveResult = null;
    // save object_in_category
    for(const categoryId of category){
      // create objectInCategoryData
      objectInCategoryData ={
        objectId : objectId,
        categoryId : categoryId
      };

      saveResult = await _this.saveWithoutId('object_in_category', objectInCategoryData);
    }

    if(!Array.isArray(updateResult)){
      // return to controller
      return updateResult;
    }else if(!Array.isArray(deleteResult)){
      // return to controller
      return deleteResult;
    }else if(!Array.isArray(saveResult)){
      // return to controller
      return saveResult;
    }else{
      // case true
      return true;
    }
  }else{
    return selectResult;
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
        // let data = {id : doc.id};
        let document = doc.data();
        // for(const key in document){
        //   data[key] = document[key];
        // }
        document['id'] = doc.id; 
        resultArray.push(document);
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
// NB: when select shared object
//     operator = 'array-contains-any'
//     word is array ex:['kawaii', 'kimoi']
exports.selectDocOneColumn = async(collectionName, columnName, operator, word) => {
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
        // let data = {id : doc.id};
        let document = doc.data();
        // for(const key in document){
        //   data[key] = document[key];
        // }
        document['id'] = doc.id; 
        resultArray.push(document);
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
//      second collection's name as 'secondColectionName'
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
        let document = doc.data();
        // let data = null;
        // if(firstCollectionName == 'containment_to_clan' && secondCollectionName == 'clan'){
        //   data = {clanId: doc.id};
        // }else if(firstCollectionName == 'my_object' && secondCollectionName == 'object'){
        //   data = {objectId: doc.id};
        // }else{
        //   // ????????????
        // }
        if(firstCollectionName == 'containment_to_clan' && secondCollectionName == 'clan'){
          document['clanId'] = doc.id;
        }else if(firstCollectionName == 'my_object' && secondCollectionName == 'object'){
          document['objectId'] = doc.id;
        }else{
          // ????????????
        }
        // for(const key in document){
        //   data[key] = document[key];
        // }
        returnArray.push(document);
      })

      return returnArray;
    }).catch(err => {
      return {err: err};
    })

    if(firstCollectionName == 'my_object' && secondCollectionName == 'object'){
      second.push(first.length);
    }

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
    const userDetailList = await userDetailRef.where('userId', 'in', userIdList).get().then(snapshot => {
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

    const myObjectList = await myObjectRef.where('userId', 'in', userIdList).where('isSelected', '==', true).get().then(snapshot => {
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
          //create flag for discover same userId
          let flag = false;

          // loop userDetailList
          for(let i = 0; i < userDetailList.length && flag == false; i++){
            let userDetail = userDetailList[i];
            if(userDetail.userId == myObject.userId){
              flag = true;
              if(userDetail.userId == userId && myObject.userId == userId){
                markerList.unshift({userId: userId, markerURL: userDetail.markerURL, objectURL: object.objectURL});
              }else{
                markerList.push({userId: userDetail.userId, markerURL: userDetail.markerURL, objectURL: object.objectURL});
              }
            }
          }
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
    const clan = await db.collection('clan').where('searchClanName', 'array-contains', searchWord).get().then(snapshot => {
      // create array
      let resultArray = [];

      if(snapshot.empty){
        // no document
        return resultArray;
      }

      snapshot.forEach(doc => {
        // judge containment
        var flag = false;
        let document = doc.data();
        
        for(var i = 0; i < userClan.length && flag == false; i++){
          // console.log(`userClan[${i}] => ${userClan[i]}`);
          if(doc.id == userClan[i]){
            flag = true;
          }
        }

        if(flag == true){
          // let data = {id : doc.id, propriety : true};
          // let document = doc.data();
          // for(const key in document){
          //   data[key] = document[key];
          // }

          document['id'] = doc.id;
          document['state'] = 'already';

          resultArray.push(document);
        }else if(flag == false){
          document['id'] = doc.id;

          // judge over
          if(document.numberOfMember >= 20){
            document['state'] = 'over';
          }else{
            document['state'] = 'can'
          }

          resultArray.push(document);
        }else{
          // ????????
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

// when you use : select object
// need category as 'category' (ex: ['kawaii', 'kimoi'])
//      page's number as 'page'
//      user's id as 'userId'
exports.searchObject = async(category, userId, page) => {
  // create length
  let userLength = 0;
  // select user's object
  const userObject = await db.collection('my_object').where('userId', '==', userId).get().then(snapshot => {
    // create result array
    let resultArray = [];

    if(snapshot.empty){
      // no document
      return resultArray;
    }

    snapshot.forEach(doc => {
      var document = doc.data();
      resultArray.push(document.objectId);
    })

    userLength = resultArray.length;

    // return to userObject
    return resultArray;
  }).catch(err => {
    return {err: err};
  })

  const categoryObject = await db.collection('object_in_category').where('categoryId', 'in', category).get().then(snapshot => {
    // create result array
    let resultArray = [];

    if(snapshot.empty){
      // no document
      return resultArray;
    }

    snapshot.forEach(doc => {
      var document = doc.data();
      resutltArray.push(document.objectId);
    })

    // return to categoryObject
    return categoryObject;
  }).catch(err => {
    return {err : err};
  })

  if(Array.isArray(userObject) && Array.isArray(categoryObject)){
    // create objectIds
    let objectIds = [];
    // not user's but match category
    for(const byCategory of categoryObject){
      var flag = false;
      for(var i = 0; i < userObject.length && flag == false; i++){
        if(byCategory == userObject[i]){
          flag == true
        }
      }

      if(flag != true){
        objectIds.push(byCategory);
      }
    }

    if(objectIds.length == 0){
      return [{
        total : userLength,
        searchResultLength : objectIds.length,
        objectList : []
      }];
    }
    
    // search object
    // create result
    let result = null;
    let resultArray = [];
    for (const objectId of objectIds){
      result = await db.collection('object').doc(objectId).get().then(doc => {
        let document = doc.data();
        document['id'] = doc.id;
        return document;
      }).catch(err => {
        return {err : err};
      });

      if(!result.hasOwnProperty('err')){
        resultArray.push(result);
      }  
    }

    resultArray.sort(function(a, b) {
      if (a.objectName < b.objectName) {
        return 1;
      } else {
        return -1;
      }
    })

    if(page == 1){
      let data = {
        total : userLength,
        searchResultLength : objectIds.length,
        objectList : resultArray.slice(0, 20)
      }

      // return to controller
      return data;
    }else if(page > 1){
      let data = {
        total : userLength,
        searchResultLength : objectIds.length,
        objectList : object.slice((20 * (page - 1))-1, page * 20)
      }

      // return to controller
      return data;
    }else{
      // ??????
    }
  }else{
    if(userObject.hasOwnProperty('err')){
      return userObject;
    }

    if(categoryObject.hasOwnProperty('err')){
      return categoryObject;
    }
  }
}

// when you use : select object
// need category as 'category' (ex: ['kawaii', 'kimoi'])
//      page's number as 'page'
//      user's id as 'userId'
exports.searchMyObject = async(userId, category, page) => {
  // create length
  let userLength = 0;
  // select user's object
  const userObject = await db.collection('my_object').where('userId', '==', userId).get().then(snapshot => {
    // create result array
    let resultArray = [];

    if(snapshot.empty){
      // no document
      return resultArray;
    }

    snapshot.forEach(doc => {
      var document = doc.data();
      resultArray.push(document.objectId);
    })

    userLength = resultArray.length;

    // return to userObject
    return resultArray;
  }).catch(err => {
    return {err: err}
  })

  if(Array.isArray(userObject)){
    if(userLength == 0){
      // user's object = 0
      return [{
        total : userLength,
        searchResultLength : userLength,
        objectList : []
      }];
    }
    if(category){
      const categoryMyObject = await db.collection('object_in_category').where('objectId', 'in', userObject).get().then(snapshot => {
        // create resultArray
        let resultArray = [];

        if(snapshot.empty){
          return resultArray;
        }

        snapshot.forEach(doc => {
          let flag = false;
          let document = doc.data();

          for(var i = 0; i < category.length && flag == false; i++){
            if(document.categoryId == category[i]){
              flag == true;
            }
          }

          if(flag == true){
            resultArray.push(document.objectId);
          }
        })

        // return to categoryMyObject
        return resultArray;
      }).catch(err => {
        return {err : err};
      })

      if(Array.isArray(categoryMyObject)){
        if(categoryMyObject.length == 0){
          // don't match category
          return [{
            total : userLength,
            searchResultLength : categoryMyObject.length,
            objectList : []
          }];
        }

        // search object
        // create result
        let result = null;
        let resultArray = [];
        for (const objectId of categoryMyObject){
          result = await db.collection('object').doc(objectId).get().then(doc => {
            let document = doc.data();
            document['id'] = doc.id;
            return document;
          }).catch(err => {
            return {err : err};
          });

          if(!result.hasOwnProperty('err')){
            resultArray.push(result);
          }  
        }

        resultArray.sort(function(a, b) {
          if (a.objectName < b.objectName) {
            return 1;
          } else {
            return -1;
          }
        })

        if(page == 1){
          let data = {
            total : userLength,
            searchResultLength : resultArray.length,
            objectList : resultArray.slice(0, 20)
          }

          // return to controller
          return data;
        }else if(page > 1){
          let data = {
            total : userLength,
            searchResultLength : resultArray.length,
            objectList : resultArray.slice((20 * (page - 1))-1, page * 20)
          }

          // return to controller
          return data;
        }else{
          // ??????
        }
      }else{
        // has error
        return categoryMyObject
      }
    }else{
      // not select category
      // search object
      // create result
      let result = null;
      let resultArray = [];
      for (const objectId of userObject){
        result = await db.collection('object').doc(objectId).get().then(doc => {
          let document = doc.data();
          document['id'] = doc.id;
          return document;
        }).catch(err => {
          return {err : err};
        });

        if(!result.hasOwnProperty('err')){
          resultArray.push(result);
        }  
      }

      resultArray.sort(function(a, b) {
        if (a.objectName < b.objectName) {
          return 1;
        } else {
          return -1;
        }
      })

      if(page == 1){
        let data = {
          total : userLength,
          searchResultLength : resultArray.length,
          objectList : resultArray.slice(0, 20)
        }

        // return to controller
        return data;
      }else if(page > 1){
        let data = {
          total : userLength,
          searchResultLength : resultArray.length,
          objectList : resultArray.slice((20 * (page - 1))-1, page * 20)
        }

        // return to controller
        return data;
      }else{
        // ??????
      }
    }
  }else{
    return userObject;
  }
}

// when you use : for prison break
// need user's id as 'userId'
//      clan's id as 'clanId'
exports.prisonBreak = async(userId, clanId) => {
  const containmentToClan = await db.collection('containment_to_clan').where('userId', '==', userId).where('clanId', '==', clanId).get().then(snapshot => {
    let id = null;
    snapshot.forEach(doc => {
      id = doc.id;
    })

    // return to containmentToClan
    return id;
  }).catch(err => {
    console.log(err);
    return false;
  });

  const result = _this.deleteDoc('containment_to_clan', containmentToClan);

  if(result.hasOwnProperty('err')){
    // has error
    console.log(err);
    return false;
  }

  return true;
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
