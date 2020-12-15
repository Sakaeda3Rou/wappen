const admin = require('firebase-admin');
const functions = require('firebase-functions');

const bucket = admin.storage().bucket();

// マーカーファイルのアップロード
exports.uploadMarker = (file_name, body) => {
  return new Promise((resolve, reject) => {

    // 整形
    body = body.replace(/.+,/, '');
    body = new Buffer(body, 'base64');

    const upload_file = bucket.file(`marker_images/${file_name}`);

    upload_file.save(body, {
      predefinedAcl: 'publicRead',
      metadata: {
        contentType: 'image/png',
      },
    });
  });
};

// パターンファイルのアップロード
exports.uploadPatt = (file_name, body) => {
  return new Promise((resolve, reject) => {

    const upload_file = bucket.file(`patterns/${file_name}`);

    upload_file.save(body, {
      predefinedAcl: 'publicRead',
      metadata: {
        contentType: 'application/octet-stream',
      },
    });
  });
};

// オブジェクトファイルのアップロード
exports.uploadObject = (file_name, body) => {
  return new Promise((resolve, reject) => {

    const upload_file = bucket.file(`object_images/${file_name}`);

    upload_file.ave(body, {
      predefinedAcl: 'publicRead',
      metadata: {
        // TODO: contentTypeを設定
        contentType: 'application/octet-stream',
      },
    });
  });
};

// パターンファイルのURLを取得
exports.getPattUrl = async (file_name) => {

  // 指定ファイルのメタデータを取得
  const file = await buket.file(`patterns/${file_name}`).getMetadata();

  // メタデータからメディアURLを取得
  const file_url = file[0].mediaLink

  return file_url;
};

// マーカーのURLを取得
exports.getMarkerUrl = async (file_name) => {

  // 指定ファイルのメタデータを取得
  const file = await bucket.file(`marker_images/${file_name}`).getMetadata();

  // メタデータからメディアURLを取得
  const file_url = file[0].mediaLink

  return file_url;
};

// オブジェクトファイルのURLを取得
exports.getObjectUrl = async (file_name) => {

  // 指定ファイルのメタデータを取得
  const file = await buket.file(`images/${file_name}`).getMetadata();

  // メタデータからメディアURLを取得
  const file_url = file[0].mediaLink

  return file_url;
};
