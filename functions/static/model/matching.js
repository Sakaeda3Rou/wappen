const userId = null;
const matching = {
    auth : null,
    offer : null,
}

exports.setUserId = (userId) => {
    this.userId = userId;
}

// auth : member or host
// offer : peerConnection's offer
exports.setMatching = (auth, offer) => {
    matching.auth = auth;
    matching.offer = offer;
}

exports.getUserId = () => {
    return this.userId;
}

exports.getMatching = () => {
    return this.matching;
}