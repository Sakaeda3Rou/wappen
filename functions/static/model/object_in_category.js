const oicId = null;
const objectInCategory = {
    categoryId : null,
    objectId : null
};

exports.setOicId = (oicId) => {
    this.oicId = oicId;
}

exports.setObjectInCategory = (categoryId, objectId) => {
    objectInCategory.categoryId = categoryId;
    objectInCategory.objectId = objectId;
}

exports.getOicId = () => {
    return this.oicId;
}

exports.getObjectInCategory = () => {
    return this.objectInCategory;
}
