const functions = require('firebase-functions');
const dao = require('./dao.js');

exports.increment_number_of_member = functions.firestore
  .document('containment_to_clan/{documentId}')
  .onCreate((snap, context) => {
    // Get an object representing the document
    // containment_to_clan {'documentId': ???, 'userId': ???, 'clanId': ???}
    const newValue = snap.data();

    const clanId = newValue.clanId;
    //オブジェクトテーブルのnumberOfAddに追加する処理かいて～
    const res = dao.incrementNumberOfAdd(clanId);
});
