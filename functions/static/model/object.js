const objectId = null;
const object = {
    numberOfAdd : null,
    objectUrl : null,
    isShared : null,
    category : null
}

exports.setObjectId = (objectId) => {
    this.objectId = objectId;
}

// NB: category is array ex: ['kawaii', 'kimoi']
exports.setObject = (numberOfAdd, objectUrl, isShared, category) => {
    object.numberOfAdd = numberOfAdd;
    object.objectUrl = objectUrl;
    object.isShared = isShared;
    object.category = category;
}

exports.getObjectId = () => {
    return this.objectId;
}

exports.getObject = () => {
    return object;
}
