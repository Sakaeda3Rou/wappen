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
    __session.user.userName = result.userName;
    __session.user.birthday = result.birthday;
    __session.user_markerURL = result.markerURL;

    // __sessionをJSONに変換
    const json = JSON.stringify(__session);

    // ユーザーをセッションに保存
    res.cookie('__session', json);

    res.render('my-page', {
      userName: result.userName,
      birthday: result.birthday,
      marker_url: result.markerURL,
    });
  }
})

// get resist user
app.get('/resist_user', (req, res) => {
  // TODO: send official clan to ejs
  const result = dao.selectDocOneColumn('clan', 'official', '==', true);

  result.forEach(doc => {
    // send to ejs
  }).catch(err => {
    // has error
  })

  res.render('profile');
});

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
  res.render('my-page', {
    userName: userName,
    birthday: birthday,
    marker_url: markerURL,
  });
});

// get my page
app.get('/my_page', (req, res) => {

  // cookieからユーザーを取得
  let user = JSON.parse(cookie.parse(req.headers.cookie).__session).user
  console.log(`session => ${user}`);

  const userName = user.userName;
  const birthday = user.birthday;
  const markerURL = user.markerURL;

  // ユーザー情報に欠損があればデータベースから取得する
  if(userName == undefined || birthday == undefined || markerURL == undefined) {
    // TODO: daoに問い合わせ
  }

  res.render('my-page', {
    userName: userName,
    birthday: birthday,
    marker_url: markerURL,
  });
});

// get profile
app.get('/profile', (req, res) => {
  // TODO: get userName, birthday
  // const result = dao.selectDocById('user_detail', req.session.user.uid);

  // const userName = result.userName;
  // const birthday = result.birthday;

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
  });
})

// get help
app.get('/help', (req, res) => {
  // TODO: cookieの確認
  console.log(`cookies => ${req.cookies}`)

  res.render('help');
})

// get camera
app.get('/camera', (req, res) => {
  res.render('camera');
});

// post camera
app.post('/camera', (req, res) => {
  // TODO: get parameter and prepare camera session
  const camera = require('./static/model/camera.js');

  // return camera
  res.render('camera');
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
  const clanId = req.body._clanId;

  // return camera
  fs.readFile('views/camera.html', 'utf-8', (err, data) => {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(data);
    res.end();
  });
})

// get my_object
app.get('/my_object', (req, res) => {
  res.render('my-object');
});

// post my_object
app.post('/my_object', (req, res) => {
  // TODO: search my_object about category
  // and sort about 'numberOfAdd'

  // return my_object
  res.render('my-object');
})

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
app.get('/clan', (req, res) => {
  // return clan page
  res.render('clan');
})

// get clan_make
app.get('/clan_make', (req, res) => {
  // return make clan page
  fs.readFile('views/make_clan.html', 'utf-8', (err, data) => {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(data);
    res.end();
  });
})

// post clan_make
app.post('/clan_make', (req, res) => {
  // TODO: send clanName for make clan
  //       save clan
  const clanName = req.body._clanName;

  const clan = require('./static/model/clan.js');
  clan.setclan(clanName, 0, false);

  const result = dao.saveWithoutId('clan', clan.getClan());

  if(result.hasOwnProperty(err)){
    // has error
  }

  // return clan page
  fs.readFile('views/make_clan.html', 'utf-8', (err, data) => {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(data);
    res.end();
  });
});

app.post('/clan_search', async (req, res) => {
  // TODO: 確認
  console.log(`search_word => ${req.body}`);
  const search_word = req.body;

  // データベースでクランを検索
  //const clanList = dao.selectDoubleTable(req.session.user.uid, 'userId', 'containment_to_clan', 'clan');
  const clanSnapshot = await dao.selectDocOneColumn('clan', 'searchClanName', 'array-contains', search_word);

  console.log(clanSnapshot);

  // 取得したリストを返す
  // res.write(`[{"clanName": "${search_word}", "numberOfMember": 0, "official": false}]`);
  res.write(`${JSON.stringify(clanSnapshot)}`);
  res.end();
});

exports.style = functions.https.onRequest((req, res) => {
  fs.readFile('static/views/css/style.css', 'utf-8', (err, data) => {
    res.writeHead(200, {'Content-Type': 'text/css'});
    res.write(data);
    res.end();
  });
});

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
