const dropZone = document.getElementById('drop-zone');
const preview = document.getElementById('preview');
const fileInput = document.getElementById('file-input');
const title = document.querySelector('.drop__title');
const btn = document.querySelector('.drop__btn');

dropZone.addEventListener('dragover', function(e) {
    e.stopPropagation();
    e.preventDefault();
    this.style.background = '#e1e7f0';
}, false);

dropZone.addEventListener('dragleave', function(e) {
    e.stopPropagation();
    e.preventDefault();
    this.style.background = '#ffffff';
}, false);

fileInput.addEventListener('change', function () {
    previewFile(this.files[0]);
});

dropZone.addEventListener('drop', function(e) {
    e.stopPropagation();
    e.preventDefault();
    title.style.visibility = 'hidden';
    btn.style.visibility = 'hidden';
    this.style.opacity = 0;
    this.style.background = '#ffffff'; //背景色を白に戻す
    const files = e.dataTransfer.files; //ドロップしたファイルを取得
    if (files.length > 1) return alert('アップロードできるファイルは1つだけです。');
    fileInput.files = files; //inputのvalueをドラッグしたファイルに置き換える。
    previewFile(files[0]);
}, false);

function previewFile(file) {
    /* FileReaderで読み込み、プレビュー画像を表示。 */
    const fr = new FileReader();
    fr.readAsDataURL(file);
    fr.onload = function() {
        const img = document.createElement('img');
        img.setAttribute('src', fr.result);
        preview.innerHTML = '';
        preview.appendChild(img);
        img.id = 'drop-zone';
    };
}
// マイオブジェクトを削除するmodalのコード
// const thumbnailsItems = document.querySelectorAll('.thumbnails__item');
// const objectModal = document.querySelector('.object-modal');
// const objectModalBg = document.querySelector('.object-modal__bg');
// const batuBtn = document.querySelector('.object-modal__batu-btn');
// const objectModalBtn = document.querySelector('.object-modal__btn');
// const modalContainer = document.querySelector('.object-modal__container');

const tickMark = "<i class=\"fas fa-check fa-lg\"></i>";
//共有オブジェクトそれぞれにクリックイベントをつける
// thumbnailsItems.forEach(thumbnailsItem => {
//     thumbnailsItem.addEventListener('click', () => {
        // objectModal.classList.toggle('object-modal__open');
        // const img = document.createElement('img');
        // img.classList.add('object-modal__select');
        // img.src = "キャプチャ.PNG";
        // if(document.querySelector('.object-modal__select')){
        //     objectModalBtn.previousElementSibling.remove();
        // }
        // modalContainer.prepend(img);
// マイオブジェクトから削除ボタンを動的に生成
        // const mainBtn = document.createElement("div");
        // mainBtn.className = "main-btn";
        // mainBtn.appendChild(document.createTextNode("マイオブジェクトから削除"));
        // objectModalBtn.innerHTML = "";
        // objectModalBtn.appendChild(mainBtn);
//共有されているオブジェクトをマイオブジェクトから削除ボタンの処理
//         objectModalBtn.addEventListener('click', () => {
//             objectModalBtn.classList.add('object-modal__btn--circle');
//             if (objectModalBtn.classList.contains('object-modal__btn--circle') === true) {
//                 mainBtn.innerHTML = tickMark;
//                 mainBtn.classList.remove('main-btn');
//             }
//         });
//     });
// });

function setMyModal(index) {
  // モーダル要素を取得
  const objectModal = document.querySelector('.object-modal');
  const objectModalBtn = document.querySelector('.object-modal__btn');
  const batuBtn = document.querySelector('.object-modal__batu-btn');

  // モーダルを開く
  objectModal.classList.toggle('object-modal__open');

  // 画像を表示する領域を取得
  const image_div_element = document.getElementById('select_image');

  image_div_element.setAttribute('style', `background-image: url("${objectList[index].objectURL}")`);

  const mainBtn = document.createElement("div");
  mainBtn.setAttribute('onclick', `objectDelete(${index})`);
  mainBtn.className = "main-btn";
  mainBtn.appendChild(document.createTextNode("マイオブジェクトから削除"));
  objectModalBtn.innerHTML = "";
  objectModalBtn.appendChild(mainBtn);



  // モーダルを閉じるボタンのアクションを追加
  batuBtn.setAttribute('onclick', 'closeModal()')

  // ボタンを取得
  // const button_element = document.getElementById('delete_button');
  //
  // button_element.setAttribute('onclick', `objectDelete("${objectList[index].objectId}")`);
  // button_element.innerHTML ='マイオブジェクトから削除';
}

function closeModal() {
  // モーダル要素を取得
  const objectModal = document.querySelector('.object-modal');

  // モーダルを閉じる
  objectModal.classList.remove('object-modal__open');
}
