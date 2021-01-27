const sao = require('./sao.js')
const {createCanvas, loadImage} = require('canvas')
const canvas = createCanvas()
const context = canvas.getContext('2d')

exports.createImage = async(uid) => {
  // 基礎imageをロード
  let image = await loadImage('static/images/wappenQR.png')

  // キャンバンスのサイズを設定
  canvas.width = image.width
  canvas.height = image.height

  // imageにuidを書き込む
  image = await drawUidToImage(uid, image)

  // pattFileStringを作成
  const pattFileString = await createPatt(image)

  // imageに黒枠を追加 マーカーの完成
  const marker = await addBlackFrame(image)

  // マーカーパターンをストレージに保存
  await sao.uploadPatt(`${uid}.patt`, pattFileString)

  // マーカーをストレージに保存
  await sao.uploadMarker(`${uid}.png`, image.src)

  // マーカーのURLを取得
  const marker_url = await sao.getMarkerUrl(`${uid}.png`);

  // 作成したマーカーのURLを返す
  return marker_url;
}

// uidを描画
async function drawUidToImage(uid, image) {
  const text1 = uid.substr(0, 14);
  const text2 = uid.substr(14, 14);

  context.drawImage(image, 0, 0, canvas.width, canvas.height)

  // 文字のスタイルを指定
  context.font = '20px sans-serif'
  context.fillSyle = '#c23a1e'

  // 文字の配置を指定
  context.textBaseline = 'center'
  context.textAlign = 'center'

  // 座標を指定して文字を描画
  var x = (canvas.width/2)
  var y = (canvas.height*3/5)
  context.fillText(text2, x, y)
  y = (canvas.height/2)
  context.fillText(text1, x, y)

  image.src = canvas.toDataURL()

  return image
}

// 黒枠を追加
async function addBlackFrame(image) {
  const frame = await loadImage('static/images/black.png')

  // キャンバスのサイズを指定
  canvas.width = frame.width
  canvas.height = frame.height

  // 全面黒に染め上げる
  context.drawImage(frame, 0, 0, canvas.width, canvas.height);

  // qrを被せる
  context.drawImage(image, 103, 103, image.width, image.height);

  image.src = canvas.toDataURL();

  return image;
}

// pattファイルを作成
async function createPatt(image) {

  canvas.width = 16;
  canvas.height = 16;

  var patternFileString = ''
  for(var orientation = 0; orientation > -2*Math.PI; orientation -= Math.PI/2) {

    context.save();
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.translate(canvas.width/2, canvas.height/2, canvas.width, canvas.height);
    context.rotate(orientation);
    context.drawImage(image, -canvas.width/2, -canvas.height/2, canvas.width, canvas.height);
    context.restore();

    var imageData = context.getImageData(0, 0, canvas.width, canvas.height)

    if (orientation !== 0) patternFileString += '\n'

    for(var channelOffset = 2; channelOffset >= 0; channelOffset--) {
      for(var y = 0; y < imageData.height; y++) {
        for(var x = 0; x < imageData.width; x++) {
          if(x !== 0) patternFileString += ' '

          var offset = (y*imageData.width*4) + (x * 4) + channelOffset
          var value = imageData.data[offset]

          patternFileString += String(value).padStart(3);
        }
        patternFileString += '\n'
      }
    }
  }

  return patternFileString
}
