const userId = null;
const matching = {
    auth : null,
    hostUserId : null,
    offer : null,
}

exports.setUserId = (userId) => {
    this.userId = userId;
}

// auth : member or host
// hostUserId : host's userId
// offer : peerConnection's offer
exports.setMatching = (auth, hostUserId, offer) => {
    matching.auth = auth;
    matching.hostUserId = hostUserId;
    matching.offer = offer;
}

exports.getUserId = () => {
    return this.userId;
}

exports.getMatching = () => {
    return this.matching;
}