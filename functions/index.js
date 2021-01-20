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

  if(!result.length){
    // no document

    // TODO: 確認
    console.log('no document');

    // make and save ARmarkerf
    const orient = require('./static/model/orient_devil.js');
    markerURL = await orient.createImage(uid);

    // パターンファイルのURLを取得
    const patternURL = await sao.getPattUrl(uid);

    // markerURLをfirestoreに保存
    dao.saveWithoutId('my_pattern', {userId: uid, patternURL: patternURL});

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

  // cookieからユーザーを取得
  let user = JSON.parse(cookie.parse(req.headers.cookie).__session).user

  let userName = req.body._name;
  let birthday = req.body._date.split('-');
  birthday = `${birthday[0]}年 ${birthday[1]}月 ${birthday[2]}日`;
  let markerURL = user.markerURL;

  // userDetailをfirestoreに格納
  const result = await dao.saveWithId('user_detail', user.uid, {uid: user.uid, userName:userName , birthday:birthday, markerURL: markerURL});

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

  // デフォルトクランに収容
  await dao.saveWithoutId('containment_to_clan', {userId: user.uid, clanId: "B6wI5YBTHV5S5WBbQNEs"});

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

    // 所属クランを取得
    const clanList = await dao.selectDoubleTable(user.uid, 'containment_to_clan', 'clan');

    // マイオブジェクトリストを取得
    const my_result = await dao.searchMyObject(user.uid, null, 1);

    // 空パターンリスト
    const patternList = [];

    res.render('camera', {
      userId: user.uid,
      objectList: my_result.objectList,
      clanList: clanList,
      patternList: patternList,
    });
  }
});

// post object_selected
app.post('/object_selected', async (req, res) => {
  // ユーザー認証
  const user = await confirmUser(req);

  if (!user) {
    res.redirect('/');
  } else {

    // オブジェクトIdを取得
    const objectId = JSON.parse(req.body).objectId;

    // 選択オブジェクトを切り替え
    // await dao.changeSelected(user.uid, objectId);

    res.end();
  }
});

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

    // クランのパターンリストを取得
    const patternList = await dao.selectMarkerList(user.uid, clanId);

    res.write(`${JSON.stringify(patternList)}`);
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

    // カテゴリーを設定
    let category = null;
    console.log('query =>');
    console.dir(req.query)
    if (req.query._request_body != undefined) {
      category = JSON.parse(req.query._request_body).searchCategoryList;
    }

    // マイオブジェクトリストを取得
    const result = await dao.searchMyObject(user.uid, category, 1);
    console.log('result=>');
    console.dir(result);

    if (result.objectList == undefined) {
      result.total = 0;
      result.objectList = [];
      result.searchResultLength = 1;
    }

    res.render('my-object', {
      categoryList: categoryList,
      total: result.total,
      objectList: result.objectList,
    });
  }
});

app.post('/object_delete', async (req, res) => {
  // ユーザーを取得
  const user = await confirmUser(req);

  if (!user) {
    res.redirect('/');
  } else {

    // パラメータを取得
    const body = JSON.parse(req.body._request_body);

    const objectId = body.objectId;

    console.log(`delete => ${objectId}`);

    // TODO: オブジェクトを削除
    

    // マイオブジェクトにリダイレクト
    res.redirect('/my_object');
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

    const number = body.number;
    const image = body.image;
    const categoryList = body.uploadCategoryList;

    // オブジェクトの位置を設定
    const locationX = 0;
    const locationY = 0;
    const locationZ = 0;

    // 画像をストレージに保存 オブジェクトファイル名
    const objectName = user.uid + number;

    await sao.uploadObject(objectName, image);
    const objectURL = await sao.getObjectUrl(objectName);

    // オブジェクトコレクションに登録
    const result = await dao.saveObject(user.uid, objectURL, categoryList, locationX, locationY, locationZ, false, objectName);

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

    // カテゴリー、ページを設定
    let category = null;
    let page = 1;
    console.log('query =>');
    console.dir(req.query)
    if (req.query._request_body != undefined) {
      const body = JSON.parse(req.query._request_body);

      console.log(`body =>`);
      console.dir(body);

      if (body.searchCategoryList.length != 0) {
        //カテゴリーを設定
        category = body.searchCategoryList;
      }

      if (body.page != undefined) {
        // ページを設定
        page = Number(body.page);
      }
    }

    // シェアオブジェクトリストを取得
    const share_result = await dao.searchObject(category, user.uid, page);
    console.log('share result =>')
    console.dir(share_result);

    if (share_result.objectList == undefined) {
      share_result.objectList = [];
      share_result.total = 0;
      share_result.searchResultLength = 0;
    }

    // マイオブジェクトリストを取得
    const my_result = await dao.searchMyObject(user.uid, null, 1);
    console.log('my_result =>')
    console.dir(my_result)

    if (my_result.objectList == undefined) {
      my_result.objectList = [];
      my_result.total = 0;
    }

    // 最大ページ
    let maxPage = Math.ceil(share_result.searchResultLength/20)
    if (maxPage == 0) {
      maxPage = 1;
    }

    res.render('object-share', {
      categoryList: categoryList,
      category: category,
      myObjectList: my_result.objectList,
      shareObjectList: share_result.objectList,
      total: my_result.total,
      nowPage: 1,
      maxPage: maxPage,
    });
  };
});

app.post('/object_shared', async (req, res) => {
  // ユーザーを取得
  const user = await confirmUser(req);

  if (!user) {
    res.redirect('/');
  } else {

    // reqestbodyを取得
    const body = JSON.parse(req.body)
    console.log(`body => `)
    console.dir(body);

    // シェアするオブジェクトのプロパティーを取得
    const objectId = body.objectId;
    const categoryList = body.categoryList;

    // シェア設定
    await dao.updateObject(objectId, categoryList);

  }

  res.end();
});

app.post('/append_my_object', async (req, res) => {
  // ユーザー認証
  const user = await confirmUser(req);

  if (!user) {
    res.redirect('/');
  } else {

    // マイオブジェクトに追加するオブジェクトを取得
    const objectId = JSON.parse(req.body).objectId;
    console.log(`share => ${objectId}`);

    // マイオブジェクトに追加
    await dao.saveWithoutId('my_object', {userId: user.uid, objectId: objectId, isSelected: false, locationX: 0, locationY: 0, locationZ: 0})

    res.end();
  }
});

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
  const user = {uid: "q5GsxMu8h2OAkmqxEY6prVzWAVj2"};
  // const user = {uid: "15ZJMpLO1zbJejmCnSJ9RCGRf632"};


  // 所属クランを取得
  // const result = await dao.selectDoubleTable(userId, 'containment_to_clan', 'clan');

  let result = null

  const category = ['aaj'];

  // マイオブジェクト取得
  // result = await dao.searchMyObject(user.uid, category, 1);

  // シェアオブジェクト取得
  result = await dao.searchObject(category, user.uid, 1)

  // マーカーリスト取得
  // const clanId = "sWuyRFv3Co7I23VoAwTZ";
  // result = await dao.selectMarkerList(user.uid, clanId);

  // マーカーURL取得
  // result = await sao.getMarkerUrl(`${user.uid}.png`);

  // カテゴリを絞って取得
  // result = await dao.searchMyObject(user.uid, ['aaj'], 1);

  console.log(`result =>`);
  console.dir(result);

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
