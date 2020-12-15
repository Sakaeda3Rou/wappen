const functions = require('firebase-functions');
const dao = require('./dao.js');

exports.updeta_number_of_add = functions.firestore
    .document('my_object/{objectId}')
    .onCreate((snap, context) => {
      // Get an object representing the document
      // my_object {'documentId': ???, 'isSelected': 'XXX','objectId': ???,  ・・・・・・}
      const newValue = snap.data();

      const objectId = newValue.objectId;
      //オブジェクトテーブルのnumberOfAddに追加する処理かいて～
      dao.incrementNumberOfAdd(objectId);
    });
