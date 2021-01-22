const cameraBtns = document.querySelectorAll('.js-btn');
const modalTitle = document.querySelector('.my-object-list__title');
const modalList = document.querySelector('.my-object-list__items');

cameraBtns.forEach(btn => {
  btn.addEventListener('click', () => { //js-btn一つ一つにclickイベントを設定
    if(btn.classList.contains('btns__btn--clan') === true){　//クラン選択ボタンを押されたらモーダルの中身をクラン選択に変更

      selectType = 0;

      modalList.innerHTML = '';
      modalTitle.innerText = '表示するクランを選択';

      for (let [index, clan] of clanList.entries()) {
        const clan_li_element = document.createElement('li');
        clan_li_element.classList.add('my-object-list__clan');
        const check = document.createElement('input');
        const label = document.createElement('label');
        check.setAttribute('type', 'radio');
        check.setAttribute('name', 'clanRadio');
        check.setAttribute('value', `${clan.clanId}`);

        clan_li_element.appendChild(label);
        label.appendChild(check);
        label.appendChild(document.createTextNode(clan.clanName));
        modalList.appendChild(clan_li_element);
      }

      const div = document.createElement('div');
      div.classList.add('main-btn');
      div.id = 'clan-select-btn';
      div.appendChild(document.createTextNode('決定'));
      modalList.appendChild(div);
      div.setAttribute('onclick', 'selectedClan()');

    } else { //マイオブジェクトボタンを押されたらmodalの中身をマイオブジェクト選択に変更

      selectType = 1;

      modalList.innerHTML = '';
      modalTitle.innerText = 'マイオブジェクトから選択';

      for (let [index, object] of objectList.entries()) {
        const object_li_element = document.createElement('li');

        object_li_element.classList.add('my-object-list__item');
        object_li_element.setAttribute('style', `background-image: url(${object.objectURL})`);
        object_li_element.setAttribute('onclick', `setMyModal(${index})`);

        modalList.appendChild(object_li_element);
      }

      const items = document.querySelectorAll('.my-object-list__item');
      const categoryMyObject = document.querySelector('.category__my-object');
      const myObjectListItems = document.querySelector('.my-object-list__items');
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

      //マイオブジェクト一覧の"マイオブジェクトを共有する"ボタンを押した時に起こる処理（サーバーに接続し、アップデート処理が必要）
      categorySubmit.addEventListener('click', () => {
        modal.classList.remove('open');
        categoryCansel.click();
      });
    };
  });
});

function setMyModal(index) {
  const items = document.querySelectorAll('.my-object-list__item');
  const categoryMyObject = document.querySelector('.category__my-object');
  const myObjectListItems = document.querySelector('.my-object-list__items');
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

  image_div_element.setAttribute('style', `background-image: url(${objectList[index].objectURL})`);

  // 決定ボタンを取得
  const share_button_element = document.getElementById('decision_button');

  share_button_element.setAttribute('onclick', `selectedObject(${index})`);

}
