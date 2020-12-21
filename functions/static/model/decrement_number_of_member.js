const functions = require('firebase-functions');
const dao = require('./dao.js');

exports.declement_number_of_member = functions.firestore
    .document('containment_to_clan/{documnetId}')
    .onDelete((snap, context) => {
        const deleteValue = snap.data();

        const clanId = deleteValue.clanId;

        const res = dao.declementNumberOfMember(clanId);
});
