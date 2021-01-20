const contents = document.querySelectorAll('.contents'); // コンテンツの取得
const line = document.querySelectorAll('.switch-btn__line'); //ステータスバーの取得
const title = document.querySelector('.home__title');
const tutorial = document.querySelector('.home__tutorial');
const aboutMe = document.querySelector('.home__aboutme');
const titleS = title.style;
const tutorialS = tutorial.style;
const aboutS = aboutMe.style;
let count = 1; // 表示させるコンテンツの番号を設定

// スマホの場合、タッチスライドで動かす
if ((navigator.userAgent.indexOf('iPhone') > 0 && navigator.userAgent.indexOf('iPad') === -1) || navigator.userAgent.indexOf('iPod') > 0 || navigator.userAgent.indexOf('Android') > 0) {
  // タッチの位置を取得するための変数
  let touchStart,
    touchMove,
    touchDistance;

    // タッチし始めた位置
    window.addEventListener('touchstart', function (e) {
      touchStart = event.touches[0].pageX;
      touchMove = event.touches[0].pageX;
    });
    // タッチし、動かした位置
    window.addEventListener('touchmove', function (e) {
      touchMove = event.touches[0].pageX;
    });
    // タッチ終了時に
    window.addEventListener('touchend', function (e) {


      // タッチの開始位置から、移動後の位置を引く
      touchDistance = touchStart - touchMove;

      // タッチスライドが右方向だったら
    if (touchDistance > 70) {
      // countの値をプラス
      count++;
      // countの値の上限をコンテンツの数にする
      if (count >= contents.length + 1) {
        count = 1;
        // count = contents.length;
      }
    }
    // タッチスライドが左方向だったら
    else if (touchDistance < -70) {
      // countの値をマイナス
      count--;
      // countの値の下限を1とする
      if (count <= 0) {
        count = contents.length;
      }
    }
    // タッチスライドがなかったら、何もしない
    else {

    }

    // 一旦コンテンツを全部非表示にして
    for (let i = 0; i < contents.length; i++) {
      contents[i].classList.remove('show'); // showクラスを削除して非表示に
      line[i].classList.remove('switch-btn__line--now'); //switch-btn__line--nowクラスを削除して非表示に
      contents[i].classList.remove('after');
      contents[i].classList.remove('before');
    }
    //該当のコンテンツのみ表示
    if((count - 2) >= 0 && count < contents.length){
      contents[count].classList.add('after');
      contents[count - 2].classList.add('before');
    }else if((count - 2) <= 0){
      contents[count].classList.add('after');
    }else if(count >= (contents.length -1)){
      contents[count - 2].classList.add('before');
    }else{
    }

    if(count - 1 === 0){
      contents[contents.length - 1].classList.add('before');
    }else if(count - 1 === contents.length - 1){
      contents[0].classList.add('after');
    }

    contents[count - 1].classList.add('show'); // showクラスを付与して表示
    line[count - 1].classList.add('switch-btn__line--now'); // switch-btn__line--nowクラスを付与して表示
  });
}
// PCの場合、ホイールで動かす
else {
  let countFlg = false; // ホイールのイベントをやたらめったに取得しないためのフラグ


  // ホイールの動きがあったら
  window.addEventListener('wheel', function (e) {

    // countFlgがfalseの場合だけ動く
    if (!countFlg) {
      // ホイールが下方向だったら
      if (e.deltaY > 0) {
        // countの値をプラス
        count++;
        // countの値の上限をコンテンツの数とする
        if (count >= contents.length + 1) {
          count = 1;
        }
      }
      // ホイールが上方向だったら
      else if (e.deltaY < 0) {
        //countの値をマイナスにする
        count--;
        // countの値の下限を1とする
        if (count <= 0) {
          count = contents.length;
        }
      }
      // countFlgをtrueにする
      countFlg = true;

      // 数秒後、countFlgをfalseにして、またホイールのイベントで動くように
      setTimeout(function () {
        countFlg = false;
      }, 1000); // 秒数を指定。ミリ秒

      // 一旦コンテンツを全部非表示にし、
      for (let i = 0; i < contents.length; i++) {
        contents[i].classList.remove('show'); // showクラスを削除して非表示に
        line[i].classList.remove('switch-btn__line--now'); //switch-btn__line--nowクラスを削除して非表示に
        contents[i].classList.remove('after');
        contents[i].classList.remove('before');
      }
      // 該当コンテンツのみ表示
      if((count - 2) >= 0 && count < contents.length){
        contents[count].classList.add('after');
        contents[count - 2].classList.add('before');
      }else if((count - 2) <= 0){
        contents[count].classList.add('after');
      }else if(count >= (contents.length -1)){
        contents[count - 2].classList.add('before');
      }else{
      }

      if(count - 1 === 0){
        contents[contents.length - 1].classList.add('before');
      }else if(count - 1 === contents.length - 1){
        contents[0].classList.add('after');
      }


      contents[count - 1].classList.add('show'); // showクラスを付与して表示
      line[count - 1].classList.add('switch-btn__line--now'); //switch-btn__line--nowクラスを削除して非表示に
    }
  });
}

const homeBtn = document.querySelector('.fancy-button');
homeBtn.addEventListener('click', () => {
    homeBtn.classList.add('active');
});

homeBtn.addEventListener('animationend', () => {
    homeBtn.classList.remove('active');
});
