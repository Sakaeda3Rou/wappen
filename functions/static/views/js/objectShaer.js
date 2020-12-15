// 検索コンテキストのアコーディオンを表示（サーバーに接続し、検索ボタンを押したときの処理を追加で書く）
const search = document.querySelector('.search__btn');
const category = document.querySelector('.search__category');
let i = document.querySelector('i');

search.addEventListener('click', () => {
    category.classList.toggle('search-open');
    i.classList.toggle('active__i');


    if (category.classList.contains('search-open')) {
        category.style.height = category.scrollHeight + 'px';
    } else {
        category.style.height = 0;
    }
});

// 共有オブジェクトをダウンロードするmodalのコード
const thumbnailsItems = document.querySelectorAll('.thumbnails__item');
const objectModal = document.querySelector('.object-modal');
const objectModalBg = document.querySelector('.object-modal__bg');
const batuBtn = document.querySelector('.object-modal__batu-btn');
const objectModalBtn = document.querySelector('.object-modal__btn');
const objectModalSelect = document.querySelector('.object-modal__select');
const tickMark = "<i class=\"fas fa-check fa-lg\"></i>";
//共有オブジェクトそれぞれにクリックイベントをつける
thumbnailsItems.forEach(thumbnailsItem => {
    thumbnailsItem.addEventListener('click', () => {
        objectModal.classList.toggle('object-modal__open');
        objectModalSelect.style.backgroundImage = "url(キャプチャ.PNG)";
// マイオブジェクトに追加するボタンを動的に生成
        const mainBtn = document.createElement("div");
        mainBtn.className = "main-btn";
        mainBtn.appendChild(document.createTextNode("マイオブジェクトに追加する"));
        objectModalBtn.innerHTML = "";
        objectModalBtn.appendChild(mainBtn);
//共有されているオブジェクトをマイオブジェクトに追加するボタンの処理（サーバーに接続し、アップデート処理が必要）
        objectModalBtn.addEventListener('click', () => {
            objectModalBtn.classList.add('object-modal__btn--circle');
            if (objectModalBtn.classList.contains('object-modal__btn--circle') === true) {
                mainBtn.innerHTML = tickMark;
                mainBtn.classList.remove('main-btn');
            }
        });
    });
});