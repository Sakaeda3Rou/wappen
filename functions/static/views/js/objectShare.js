// 検索コンテキストのアコーディオンを表示（サーバーに接続し、検索ボタンを押したときの処理を追加で書く）
const search = document.querySelector('.search__btn');
const category = document.querySelector('.search__category');
const icon = document.querySelector('.search__icon');
const line1 = document.querySelector('.add-btn__line--1');
const line2 = document.querySelector('.add-btn__line--2');

search.addEventListener('click', () => {
    category.classList.toggle('search-open');
    icon.classList.toggle('active__i');


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
const modalContainer = document.querySelector('.object-modal__container');

const tickMark = "<i class=\"fas fa-check fa-lg\"></i>";

//マイオブジェクト一覧を表示
const modalList = document.querySelector('.my-object-list__items');
const modalTitle = document.querySelector('.my-object-list__title');
const addBtn = document.querySelector('.add-btn');

//プラスボタンをクリックしたときにマイオブジェクト一覧を動的に生成する。
addBtn.addEventListener('click', () => {
    modalList.innerHTML = '';
    modalTitle.innerText = 'マイオブジェクトから選択';

    for (let [index, object] of myObjectList.entries()) {
      const li = document.createElement('li');
      li.setAttribute('style', `background-image: url("${object.objectURL}")`);
      li.setAttribute('onclick', `setMyModal(${index})`);

      li.classList.add('my-object-list__item');
      //li.appendChild(document.createTextNode(object));
      modalList.appendChild(li);
    }

    //マイオブジェクト一覧のオブジェクトを選択したときにアコーディオンを表示する
    const myObjectListItems = document.querySelector('.my-object-list__items');
    const categoryMyObject = document.querySelector('.category__my-object');
    const categoryCansel = document.querySelector('.my-object-list__cansel');
    const categorySubmit = document.querySelector('.my-object-list__submit');

    //マイオブジェクト一覧の"キャンセルボタン"を押したときの処理
    categoryCansel.addEventListener('click', () => {
        categoryMyObject.classList.remove('category-open');
        myObjectListItems.classList.remove('my-object-list__items--close');

        if (categoryMyObject.classList.contains('category-open')) {
            categoryMyObject.style.height = '80%';
        } else {
            categoryMyObject.style.height = 0;
        }

        if (myObjectListItems.classList.contains('my-object-list__items--close')) {
            myObjectListItems.style.height = 0;
        } else {
            myObjectListItems.style.height = '80%';
        }
    });
});

function setShareModal(index) {
  const objectModal = document.querySelector('.object-modal');
  const objectModalBg = document.querySelector('.object-modal__bg');
  const batuBtn = document.querySelector('.object-modal__batu-btn');
  const objectModalBtn = document.querySelector('.object-modal__btn');
  const modalContainer = document.querySelector('.object-modal__container');

  objectModal.classList.toggle('object-modal__open');

  // 画像を表示する領域を取得
  const image_div_element = document.getElementById('select_object');
  image_div_element.setAttribute('style', `background-image: url("${shareObjectList[index].objectURL}")`);

  const mainBtn = document.createElement('div');
  mainBtn.className = 'main-btn';
  mainBtn.appendChild(document.createTextNode('マイオブジェクトに追加する'));
  objectModalBtn.innerHTML = "";
  objectModalBtn.appendChild(mainBtn);
  objectModalBtn.setAttribute('onclick', `appendMyObject("${shareObjectList[index].objectId}")`);

  // ✗ボタンを押した時、モーダルを閉じる
  batuBtn.addEventListener('click', () => {
    objectModal.classList.remove('object-modal__open');
  });
}

function setMyModal(index) {
  const myObjectListItems = document.querySelector('.my-object-list__items');
  const categoryMyObject = document.querySelector('.category__my-object');
  const categoryCansel = document.querySelector('.my-object-list__cansel');
  const categorySubmit = document.querySelector('.my-object-list__submit');

  categoryMyObject.classList.toggle('category-open');
  myObjectListItems.classList.toggle('my-object-list__items--close');

  if (categoryMyObject.classList.contains('category-open')) {
      categoryMyObject.style.height = '80%';
  } else {
      categoryMyObject.style.height = 0;
  }

  if (myObjectListItems.classList.contains('my-object-list__items--close')) {
      myObjectListItems.style.height = 0;
  } else {
      myObjectListItems.style.height = '80%';
  }

  // 画像を表示する領域を取得
  const image_div_element = document.getElementById('select_image');

  image_div_element.setAttribute('style', `background-image: url("${myObjectList[index].objectURL}")`);

  // シェアボタンを取得
  const share_button_element = document.getElementById('share_button');

  share_button_element.setAttribute('onclick', `objectShared("${myObjectList[index].objectId}")`);
}
