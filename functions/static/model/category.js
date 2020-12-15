const categoryId = null;
const category = {
  categoryName : null
}

exports.setCategoryId = (categoryId) => {
  this.categoryId = categoryId;
}

exports.setCategory = (categoryName) => {
  category.categoryName = categoryName;
}
exports.getCategoryId = () => {
  return this.categoryId;
}

exports.getCategory = () => {
  return category;
}
