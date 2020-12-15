const ctcId = null;
const containmentToClan = {
    userId : null,
    clanId : null
}

exports.setCtcId = (ctcId) => {
    this.ctcId = ctcId;
}

exports.setContainmentToClan = (userId, clanId) => {
    containmentToClan.userId = userId;
    containmentToClan.clanId = clanId;
}

exports.getCtcId = () => {
    return this.ctcId;
}

exports.getContainmentToClan = () => {
    return containmentToClan;
}
