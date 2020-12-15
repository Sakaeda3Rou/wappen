const moId = null;
const myObject = {
    userId : null,
    objectId : null,
    isSelected : null,
    locationX : null,
    locationY : null,
    locationZ : null
};

exports.setMoId = (moId) => {
    this.moId = moId;
}

exports.setMyObject = (userId, objectId, isSelected, locationX, locationY, locationZ) => {
    myObject.userId = userId;
    myObject.objectId = objectId;
    myObject.isSelected = isSelected;
    myObject.locationX = locationX;
    myObject.locationY = locationY;
    myObject.locationZ = locationZ;
}

exports.getMoId = () => {
    return this.moId;
}

exports.getMyObject = () => {
    return myObject;
}
