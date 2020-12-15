const mpId = null;
const myPattern = {
    userId : null,
    patternUrl : null
}

exports.setMpId = (mpId) => {
    this.mpId = mpId;
}

exports.setMyPattern = (userId, patternUrl) => {
    myPattern.userId = userId;
    myPattern.patternUrl = patternUrl;
}

exports.getMpId = () => {
    return this.mpId;
}

exports.getMyPattern = () => {
    return myPattern;
}
