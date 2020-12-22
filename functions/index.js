const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cookie = require('cookie');
const dao = require('./static/model/dao.js');

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

// post login
app.post('/login', async(req, res) => {

  // uidパラメータを取得
  const uid = req.body.uid;
  const user = {uid: uid};

  // cookieに保存する情報を生成
  let __session = {user: user};

  // NB: insert userId at userId from session

  const result = await dao.selectDocById('user_detail', uid);
  console.log(`result => ${result}`)
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
      marker_url: `${markerURL}`,
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


    // TODO: データベースから所属クランリストを取得
    // const result = await dao.selectDoubleTable(user.uid, 'userId', 'containment_to_clan',  'clan');
    console.log('result => ');
    console.dir(result);

    const clanList = [{clanId: 1, clanName: "ぴえん"}, {clanId: 2, clanName: "ぴっぴ"}];

    res.render('my-page', {
      userName: userName,
      birthday: birthday,
      marker_url: markerURL,
      clanList: clanList,
    });
  }
});

// get profile
app.get('/profile', (req, res) => {

  // cookieからユーザーを取得
  let user = JSON.parse(cookie.parse(req.headers.cookie).__session).user

  const userName = user.userName;
  const birthday = user.birthday;
  const markerURL = user.markerURL;

  // TODO: insert to html's textbox by ejs

  res.render('profile', {
    // aタグ(キャンセルボタン)のリンク先をマイページ画面に設定
    cancel_link_url: '/my_page',
    form_action_url: '/profile',
    marker_url: `${markerURL}`,
  });
});

// update profile
app.post('/profile', (req, res) => {

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


  res.render('my-page', {
    userName: userName,
    birthday: birthday,
    // TODO: clanListを設定
    clanList: [{}],
  });
})

// get help
app.get('/help', async (req, res) => {
  // TODO: cookieの確認
  const user = await confirmUser(res);

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

    // TODO: とりあえずリスト
    const objectList = [{objectURL: "my_object/1"}, {objectURL: "my_object/2"}]
    const clanList = [{clanId: 1, clanName: "ぴえん"}, {clanId: 2, clanName: "ぴっぴ"}];
    const clanUser = [{markerURL: "marker/1", objectURL: "object/1"}, {markerURL: "marker/#", objectURL: "object/2"}];


    res.render('camera', {
      objectList: objectList,
      clanList: clanList,
      clanUser: clanUser,
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

// get clan_selected
app.get('/clan_selected', (req, res) => {
  fs.readFile('views/clan_selected.html', 'utf-8', (err, data) => {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(data);
    res.end();
  });
})

// post clan_selected
app.post('/clan_selected', (req, res) => {
  // TODO: send parameter about clan
  //       make data about clan for camera
  // const clanId = req.body._clanId;

  // return camera
  fs.readFile('views/camera.html', 'utf-8', (err, data) => {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(data);
    res.end();
  });
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
    const categoryList = [{categoryId: 1, categoryName: "ほのお"}, {categoryId: 2, categoryName: "みず"}, {categoryId: 3, categoryName: "くさ"}];

    // マイオブジェクトリストを取得
    const myObjectList = [{myObjectId: 1, Name: "a"}];

    res.render('my-object', {
      categoryList: categoryList,
      myObjectList: myObjectList,
    });
  }
});

// post my_object
app.post('/my_object', (req, res) => {
  // TODO: search my_object about category
  // and sort about 'numberOfAdd'

  // return my_object
  res.render('my-object');
})

app.post('/search_object', (req, res) => {

  // プロパティーを取得
  const body = JSON.parse(req.body);
  console.log(`body => ${body}`);
  console.log(`body type => ${typeof body}`);
  console.dir(body);

  // TODO: 確認
  console.log('search_object finished');

  res.end();
});

// get add_object
app.get('/add_object', (req, res) => {
  fs.readFile('views/add_object.html', 'utf-8', (err, data) => {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(data);
    res.end();
  });
})

// post add_object
app.post('/add_object', (req, res) => {
  // TODO: save in storage and make object
  //       require sao, dao
  //       then save object make var about objectId

  // TODO: send data about my_object and save
  const locationX = req.body._locationX;
  const locationY = req.body._locationY;
  const locationZ = req.body._locationZ;

  const myObject = require('./static/model/my_object.js');

  myObject.setMyObject(req.session.user.uid, objectId, true, locationX, locationY, locationZ);

  const result = dao.saveWithoutId('my_object', myObject.getMyObject());

  if(result.hasOwnProperty(err)){
    // has error
  }

  // return my_object
  fs.readFile('views/my_object.html', 'utf-8', (err, data) => {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(data);
    res.end();
  });
})

// get share_object
app.get('/share_object', (req, res) => {
  res.render('object-share');
});

// post share_object
app.post('/share_object', (req, res) => {
  // TODO: send word for search
  //       and do search, return result

  // return share_object
  res.render('object-share');
})

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
    // save clan
    const clanName = req.body;

    const clan = require('./static/model/clan.js');
    clan.setclan(clanName, 0, false);

    const result = dao.saveWithoutId('clan', clan.getClan());

    console.log(`result => ${result}`);
    console.dir(result);

    if(result.hasOwnProperty(err)){
      // has error
    }

    // TODO: ユーザーをクランに加入させる
    // const result = await dao.saveWithoutId('containment_to_clan', {userId: user.uid, clanId: clanId});

    // return clan page
    res.redirect('my_page');
  }
});

app.post('/clan_out', async (req, res) => {
  // ユーザーを取得
  const user = await confirmUser(req);

  if (!user) {
    res.redirect('/');
  } else {

    // クランIDを取得
    const clanId = req.body;

    // TODO: 脱退処理


    res.write('out clan');
    res.end();
  }
});

// クラン検索
app.post('/clan_search', async (req, res) => {
  // TODO: 確認
  console.log(`search_word => ${req.body}`);
  const search_word = req.body;

  // ユーザーを取得
  let user = JSON.parse(cookie.parse(req.headers.cookie).__session).user

  // データベースでクランを検索
  const clanList = await dao.searchClan(search_word, user.uid);

  // TODO: 確認
  console.log('clan search finished');

  // 取得したリストを返す
  res.write(`${JSON.stringify(clanList)}`);
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
