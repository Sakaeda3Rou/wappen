const functions = require('firebase-functions');
const dao = require('./dao.js');

exports.clan_delete = functions.firestore
    .document('clan/{documentId}')
    .onUpdate((change, context) => {
      // Get an object representing the document
      // clan {'documentId': ???, 'clanName': 'XXX', 'numberOfMember': ??}
      const newValue = change.after.data();

      // ...or the previous value before this update
      const previousValue = change.before.data();

      const clanId = context.params.documentId;
      const numberOfMember = newValue.numberOfMember;
      if(numberOfMember = 0){
        //クランを削除する処理かいて～
        const res = dao.deleteDoc('clan', clanId);
      }else{

      }

    });
