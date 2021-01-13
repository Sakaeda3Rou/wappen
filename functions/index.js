const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cookie = require('cookie');
const dao = require('./static/model/dao.js');
const sao = require('./static/model/sao.js');

const app = express();

// テンプレートエンジンを設定
app.set('view engine', 'ejs');

// viewsの参照ディレクトリを設定
app.set('views', 'static/views')

// 静的ファイルのディレクトリを設定
app.use(express.static('static'));

async function confirmUser(req) {
  // cookieからユーザーを取得
  // TODO: cookieになかった場合にデータベースから取得すべきか
  try {
    let user = JSON.parse(cookie.parse(req.headers.cookie).__session).user;

    // ユーザー情報に欠損がないか
    if (user.userName == undefined || user.birthday == undefined || user.markerURL == undefined) {
      // 欠損があった場合データベースから取得
      const result = await dao.selectDocById('user_detail', uid)

      // プロフィールをセット
      user.userName = result[0].userName
      user.birthday = result[0].birthday
      user.markerURL = result[0].markerURL

      // セッションに保存
      __session.user = user;

      // __sessionをJSONに変換
      const json = JSON.stringify(__session);

      // ユーザーをセッションに保存
      res.cookie('__session', json);
    }

    return user;
  } catch {
    return null;
  }

}

exports.app = functions.https.onRequest(app);

// logout
app.get('/logout', async (req, res) => {
  // cookieを削除
  res.clearCookie('__session');

  // ホーム画面にリダイレクト
  res.redirect('/');
});

// post login
app.post('/login', async (req, res) => {

  // uidパラメータを取得
  const uid = req.body.uid;
  const user = {uid: uid};

  // cookieに保存する情報を生成
  let __session = {user: user};

  // NB: insert userId at userId from session

  const result = await dao.selectDocById('user_detail', uid);
  console.log(`login result => ${result}`);
  console.dir(result);

  if(!result){
    // no document

    // TODO: 確認
    console.log('no document');

    // make and save ARmarkerf
    const orient = require('./static/model/orient_devil.js');
    markerURL = await orient.createImage(uid);

    // markerURLをfirestoreに保存
    dao.saveWithoutId('my_pattern', {userId: uid, patternURL: markerURL});

    // markerURLをセッションに追加
    __session.user.markerURL = markerURL;

    // __sessionをJSONに変換
    const json = JSON.stringify(__session);

    // ユーザーをセッションに保存
    res.cookie('__session', json);

    res.render('profile', {
      // aタグ(キャンセルボタン)のリンク先をホーム画面に設定
      cancel_link_url: '/',
      form_action_url: '/resist_user',
      markerURL: `${markerURL}`,
    });
  }else{
    // not first login

    // ユーザー情報をセッションに追加
    __session.user.userName = result[0].userName;
    __session.user.birthday = result[0].birthday;
    __session.user.markerURL = result[0].markerURL;

    // __sessionをJSONに変換
    const json = JSON.stringify(__session);

    // ユーザーをセッションに保存
    res.cookie('__session', json);

    // マイページへ遷移
    res.redirect('/my_page');
  }
})

// post resist user
app.post('/resist_user', async (req, res) => {
  // パラメータを取得
  // FIXME: userName : {adana: 'UNC_Saikyouman'}

  // cookieからユーザーを取得
  let user = JSON.parse(cookie.parse(req.headers.cookie).__session).user

  let userName = req.body._name;
  let birthday = req.body._date.split('-');
  birthday = `${birthday[0]}年 ${birthday[1]}月 ${birthday[2]}日`;
  let markerURL = user.markerURL;

  // userDetailをfirestoreに格納
  const result = await dao.saveWithId('user_detail', user.uid, {userName:userName , birthday:birthday, markerURL: markerURL});

  // ユーザー情報をセッションに追加
  user.userName = userName;
  user.birthday = birthday;
  const __session = {user: user}

  // __sessionをJSONに変換
  const json = JSON.stringify(__session);

  // ユーザーをセッションに保存
  res.cookie('__session', json);

  if(result.hasOwnProperty('err')){
    // has error
    console.log(`hasOwnProperty error: ${result.err}`);
  }

  // マイページへの遷移
  res.redirect('/my_page');
});

// get my page
app.get('/my_page', async (req, res) => {

  // cookieからユーザーを取得
  const user = await confirmUser(req);

  if (!user) {
    res.redirect('/');
  } else {
    const userName = user.userName;
    const birthday = user.birthday;
    const markerURL = user.markerURL;


    // データベースから所属クランリストを取得
    const clanList = await dao.selectDoubleTable(user.uid, 'containment_to_clan',  'clan');

    res.render('my-page', {
      userName: userName,
      birthday: birthday,
      markerURL: markerURL,
      clanList: clanList,
    });
  }
});

// get profile
app.get('/profile', async (req, res) => {

  // cookieからユーザーを取得
  const user = await confirmUser(req);

  console.log(`user => ${user}`)

  if (!user) {
    res.redirect('/');
  } else {
    const userName = user.userName;
    const birthday = user.birthday;
    const markerURL = user.markerURL;

    // TODO: insert to html's textbox by ejs

    res.render('profile', {
      // aタグ(キャンセルボタン)のリンク先をマイページ画面に設定
      cancel_link_url: '/my_page',
      form_action_url: '/profile',
      markerURL: `${markerURL}`,
    });
  }
});

// update profile
app.post('/profile', async (req, res) => {

  // cookieからユーザーを取得
  let user = JSON.parse(cookie.parse(req.headers.cookie).__session).user

  let userName = req.body._name;
  let birthday = req.body._date.split('-');
  birthday = `${birthday[0]}年 ${birthday[1]}月 ${birthday[2]}日`;
  let markerURL = user.markerURL;

  user.userName = userName;
  user.birthday = birthday;

  // TODO: throw datas for update

  const result = dao.updateDoc('user_detail', user.uid, user);

  if(result.hasOwnProperty('err')){
    // has error
  }

  const __session = {user: user}

  // __sessionをJSONに変換
  const json = JSON.stringify(__session);

  // ユーザーをセッションに保存
  res.cookie('__session', json);

  // TODO: データベースから所属クランリストを取得
  const clanList = await dao.selectDoubleTable(user.uid, 'containment_to_clan',  'clan');

  res.render('my-page', {
    userName: userName,
    birthday: birthday,
    markerURL: user.markerURL,
    clanList: clanList,
  });
})

// get help
app.get('/help', async (req, res) => {
  // TODO: cookieの確認
  const user = await confirmUser(req);

  console.log(`user => ${user}`);

  if (!user) {
    res.redirect('/');
  } else {
    res.render('help');
  }
});

// get camera
app.get('/camera', async (req, res) => {
  // cookieからユーザーを取得
  const user = await confirmUser(req);

  if (!user) {
    res.redirect('/');
  } else {
    // get parameter and prepare camera session
    const camera = require('./static/model/camera.js');

    // TODO: 必要なもの: 所属クラン、my_object

    // 所属クランを取得
    const clanList = await dao.selectDoubleTable(user.uid, 'containment_to_clan', 'clan');

    // TODO: マイオブジェクトリストを取得
    // const objectList = await dao.searchMyObject(user.uid, null, null);
    const objectList = [{id: "a", objectURL: "https://storage.googleapis.com/download/storage/v1/b/wappen-3876c.appspot.com/o/object_images%2Fq5GsxMu8h2OAkmqxEY6prVzWAVj2?generation=1610430596097215&alt=media"}];

    // TODO: とりあえずリスト
    const markerList = [];
    // const markerList = [{markerURL: "marker/1", objectURL: "object/1"}, {markerURL: "marker/2", objectURL: "object/2"}];


    res.render('camera', {
      objectList: objectList,
      clanList: clanList,
      markerList: markerList,
    });
  }
});

// post camera
app.post('/camera', async (req, res) => {
  // cookieからユーザーを取得
  const user = await confirmUser(req);

  if (!user) {
    res.redirect('/');
  } else {

    res.render('camera');
    res.end();
  }
})

// get object_selected
app.get('/object_selected', (req, res) => {
  fs.readFile('views/object_selected.html', 'utf-8', (err, data) => {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(data);
    res.end();
  });
})

// post object_selected
app.post('/object_selected', (req, res) => {
  // TODO: send parameter about object
  const newObjectId = req.body._newObjectId;

  const result = dao.changeSelected(req.session.user.uid, newObjectId);

  if(result.hasOwnProperty(err)){
    // has error
  }

  // return camera
  fs.readFile('views/camera.html', 'utf-8', (err, data) => {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(data);
    res.end();
  });
})

// post clan_selected
app.post('/clan_selected', async (req, res) => {
  // TODO: 選択されたクランのマーカーリストを取得する
  // ユーザーを取得
  const user = await confirmUser(req);

  if (!user) {
    res.redirect('/');
  } else {
    // 選択したクランのIDを取得
    const clanId = JSON.parse(req.body).clanId;

    // クランのマーカーリストを取得
    // const markerList = await selectMarkerList(user.uid, clanId);

    const markerList = [{
      id: "a",
      markerURL: "https://storage.googleapis.com/download/storage/v1/b/wappen-3876c.appspot.com/o/marker_images%2Fq5GsxMu8h2OAkmqxEY6prVzWAVj2.png?generation=1608169696971073&alt=media",
      objectURL: "https://storage.googleapis.com/download/storage/v1/b/wappen-3876c.appspot.com/o/object_images%2Fq5GsxMu8h2OAkmqxEY6prVzWAVj2?generation=1610430596097215&alt=media",
    }]


    res.write(`${JSON.stringify(markerList)}`);
    res.end();
  }
})

app.post('/containment_clan', async (req, res) => {
  // ユーザーを取得
  const user = await confirmUser(req);

  // 加入するクランIDを取得
  const clanId = req.body;

  if (!user) {
    res.redirect('/');
  } else {
    // クランに加入
    const result = await dao.saveWithoutId('containment_to_clan', {userId: user.uid, clanId: clanId});

    res.write(result.toString());
    res.end();
  }
});

// get my_object
app.get('/my_object', async (req, res) => {
  // userIdを取得
  const user = await confirmUser(req);

  if (!user) {
    res.redirect('/');
  } else {

    // カテゴリーリストを取得
    const categoryList = await dao.selectAll('category');
    console.dir(categoryList)

    // TODO: bodyからカテゴリー、末尾のobjectIdを取得 →　分岐
    let category = null
    let objectId = null

    // マイオブジェクトリストを取得
    // objectList = [{objectId: "oB7ZB1QtIQOQs35T9jm8", objectURL: "https://storage.googleapis.com/download/storage/v1/b/wappen-3876c.appspot.com/o/object_images%2Fq5GsxMu8h2OAkmqxEY6prVzWAVj2?generation=1610430596097215&alt=media"}, {objectId: "oB7ZB1QtIQOQs35T9jm8", objectURL: "https://storage.googleapis.com/download/storage/v1/b/wappen-3876c.appspot.com/o/object_images%2Fq5GsxMu8h2OAkmqxEY6prVzWAVj2?generation=1610430596097215&alt=media"}]
    const result = await dao.searchMyObject(user.uid, category, objectId);
    console.log('result=>');
    console.dir(result);

    res.render('my-object', {
      categoryList: categoryList,
      objectList: result.objectList,
      page: total/20,
    });
  }
});

app.post('/search_object', async (req, res) => {

  // ユーザーを取得
  const user = await confirmUser(req);

  if (!user) {
    res.redirect('/');
  } else {
    // プロパティーを取得
    const body = JSON.parse(req.body)
    const objectList = body.objectList
    const searchCategoryList = body.searchCategoryList

    console.log(`objectList => ${objectList}`);
    console.dir(objectList);
    console.log(`searchCategoryList => ${searchCategoryList}`);
    console.dir(searchCategoryList);

    // TODO: 検索結果リストを取得


    res.end();
  }
});

// post add_object
app.post('/object_upload', async (req, res) => {
  // ユーザーを取得
  const user = await confirmUser(req);

  if (!user) {
    res.redirect('/');
  } else {

    // パラメータを取得
    const body = JSON.parse(req.body._request_body);

    const image = body.image;
    const categoryList = body.uploadCategoryList;

    // TODO: send data about my_object and save
    const locationX = 0;
    const locationY = 0;
    const locationZ = 0;

    // 画像をストレージに保存 オブジェクトファイル名
    const fileName = user.uid;

    await sao.uploadObject(fileName, image);
    const objectURL = await sao.getObjectUrl(fileName);

    // オブジェクトコレクションに登録
    const result = await dao.saveObject(user.uid, objectURL, categoryList, locationX, locationY, locationZ, false);

    // マイオブジェクト画面にリダイレクト
    res.redirect('/my_object');
  }
})

// get share_object
app.get('/object_share', async (req, res) => {
  // ユーザーを取得
  const user = await confirmUser(req);

  if (!user) {
    res.redirect('/');
  } else {

    // カテゴリリストを取得
    // カテゴリーリストを取得
    const categoryList = await dao.selectAll('category');
    console.dir(categoryList)

    // シェアオブジェクトリストを取得
    const shareObjectList = [{id: 'a', objectURL: 'https://storage.googleapis.com/download/storage/v1/b/wappen-3876c.appspot.com/o/object_images%2Fq5GsxMu8h2OAkmqxEY6prVzWAVj2?generation=1610430596097215&alt=media'}];

    // マイオブジェクトリストを取得
    const result = await dao.searchMyObject(user.uid, null, null);
    result.objectList = [{id: "a", objectURL: "https://storage.googleapis.com/download/storage/v1/b/wappen-3876c.appspot.com/o/object_images%2Fq5GsxMu8h2OAkmqxEY6prVzWAVj2?generation=1610430596097215&alt=media"}];

    res.render('object-share', {
      categoryList: categoryList,
      myObjectList: result.objectList,
      shareObjectList: shareObjectList,
      total: result.total,
    });
  };
});

// get share_my_object
app.get('/share_my_object', (req, res) => {
  // return my_object table page
  fs.readFile('views/my_object_table.html', 'utf-8', (err, data) => {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(data);
    res.end();
  });
})

// post share_my_object
app.post('/share_my_object', (req, res) => {
  // TODO: send id about my_object's documentId
  const docId = req.body._docId;

  const result = dao.selectDocById('my_object', docId);

  if(result.hasOwnProperty(err) || result == null){
    // has error
  }

  // return config my_object page
  fs.readFile('views/config_my_object.html', 'utf-8', (err, data) => {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(data);
    res.end();
  });
})

// put share_my_object
app.put('/share_my_object', (req, res) => {
  // TODO: send id about my_object's objectId
  //       and update 'isShared'
  const objectId = req.body._objectId;

  const result = dao.updateDoc('object', objectId, {isShared: true});

  if(result.hasOwnProperty(err)){
    // has error
  }

  // return my_object table page
  fs.readFile('views/my_object_table.html', 'utf-8', (err, data) => {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(data);
    res.end();
  });
})

//get clan
app.get('/clan', async (req, res) => {

  // ユーザー認証
  const user = await confirmUser(req);

  if (!user) {
    res.redirect('/');
  } else {
    res.render('clan');
  }
});

// post clan_make
app.post('/clan_make', async (req, res) => {
  // TODO: send clanName for make clan

  // ユーザーを取得
  const user = await confirmUser(req);

  if (!user) {
    res.redirect('/');
  } else {
    // 作成するクラン名を取得
    const clanName = req.body._clanName;

    // 検索時のワードを設定
    let searchClanName = []
    for (let i = 1; i <= clanName.length; i++) {
      searchClanName.push(clanName.substring(0, i));
    }

    // clanオブジェクトを作成
    const clan = require('./static/model/clan.js');
    clan.setClan(clanName, searchClanName, 0, false);

    // データベースにクランを保存
    const result = await dao.saveWithoutId('clan', clan.getClan());

    // クランIDを取得
    const clanId = result.id;

    if(result.hasOwnProperty("err")){
      // has error
    }

    // ユーザーをクランに加入させる
    await dao.saveWithoutId('containment_to_clan', {userId: user.uid, clanId: clanId});

    // マイページへリダイレクト
    res.redirect('/my_page');
  };
});

app.post('/clan_out', async (req, res) => {
  // ユーザーを取得
  const user = await confirmUser(req);

  if (!user) {
    res.redirect('/');
  } else {

    // クランIDを取得
    const clanId = JSON.parse(req.body).clanId;

    // 脱退処理
    dao.prisonBreak(user.uid, clanId);

    res.end();
  }
});

// クラン検索
app.post('/clan_search', async (req, res) => {
  // 検索ワードを取得
  const searchWord = JSON.parse(req.body).searchWord;

  // ユーザーを取得
  let user = JSON.parse(cookie.parse(req.headers.cookie).__session).user

  // データベースでクランを検索
  const clanList = await dao.searchClan(searchWord, user.uid);

  // 取得したリストを返す
  res.write(`${JSON.stringify(clanList)}`);
  res.end();
});

// TODO: test
app.get('/test', async (req, res) => {
  // userId
  const userId = "q5GsxMu8h2OAkmqxEY6prVzWAVj2";

  // 所属クランを取得
  // const result = await dao.selectDoubleTable(userId, 'containment_to_clan', 'clan');


  // my_objectを取得
  // const result = await dao.selectDocOneColumn('my_object', 'userId', '==', user.uid, null);
  // console.log(`result => ${result}`);
  // console.dir(result)

  const category = null
  const objectId = null

  const myObjectList = await dao.searchMyObject(userId, category, objectId);
  console.log(`myobjectList => ${myObjectList}`);
  console.dir(myObjectList);

  // res.render('ar_test');

  res.end();
});

// stylesheet
exports.style = functions.https.onRequest((req, res) => {
  fs.readFile('static/views/css/style.css', 'utf-8', (err, data) => {
    res.writeHead(200, {'Content-Type': 'text/css'});
    res.write(data);
    res.end();
  });
});

// reset css
exports.reset = functions.https.onRequest((req, res) => {
  fs.readFile('static/views/css/reset.css', 'utf-8', (err, data) => {
    res.writeHead(200, {'Content-Type': 'text/css'});
    res.write(data);
    res.end();
  });
});

exports.home = functions.https.onRequest((req, res) => {
  fs.readFile('static/views/js/home.js', 'utf-8', (err, data) => {
    res.writeHead(200, {'Content-type': 'text/javascript'});
    res.write(data);
    res.end();
  });
});
