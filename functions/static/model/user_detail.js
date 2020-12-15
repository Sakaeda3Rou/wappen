const userId = null;
const userDetail = {
  userName : null,
  birthday : null
}

//getter
exports.getUserId = () => {
  return this.userId;
}

exports.getUserDetail = () => {
  return userDetail;
}

//setter
exports.setUserId = (userId) => {
  this.userId = userId;
}

exports.setUserDetail = (userName, birthday) => {
  userDetail.userName = userName;
  userDetail.birthday = birthday;
//   console.log('userDetail["userName"] : ' + userDetail['userName']);
//   console.log('userDetail["birthday"] : ' + userDetail['birthday']);

}
