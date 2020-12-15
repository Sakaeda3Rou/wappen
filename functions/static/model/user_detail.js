const userId = null;
const userDetail = {
  userName : null,
  birthday : null,
  marker_url : null
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

exports.setUserDetail = (userName, birthday, marker_url) => {
  userDetail.userName = userName;
  userDetail.birthday = birthday;
  userDetail.marker_url = marker_url;
//   console.log('userDetail["userName"] : ' + userDetail['userName']);
//   console.log('userDetail["birthday"] : ' + userDetail['birthday']);

}
