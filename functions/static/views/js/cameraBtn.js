const cameraBtns = document.querySelectorAll('.js-btn');
const modalTitle = document.getElementById('modal__title');
const modalList = document.getElementById('modal__list');

// clans配列にサーバーから所属クランの一覧を
// clanList = ['クラン１', 'クラン2', 'クラン3','クラン4','クラン5', 'クラン6', 'クラン7','クラン8','クラン１', 'クラン2', 'クラン3','クラン4','クラン5', 'クラン6', 'クラン7','クラン8'];
// objectList = ['オブジェクト1', 'オブジェクト2', 'オブジェクト3','オブジェクト4', 'オブジェクト5', 'オブジェクト6', 'オブジェクト7', 'オブジェクト8'];

cameraBtns.forEach(btn => {
    btn.addEventListener('click', () => { //js-btn一つ一つにclickイベントを設定
        if(btn.classList.contains('btns__btn--clan') === true){　//クラン選択ボタンを押されたらモーダルの中身をクラン選択に変更
            modalList.innerHTML = '';
            modalTitle.innerText = '表示するクランを選択';
            clanList.forEach(clan => {
                const li = document.createElement('li');
                const check = document.createElement('input');
                const label = document.createElement('label');
                check.setAttribute('type', 'radio');
                check.setAttribute('name', 'clanRadio');

                li.appendChild(label);
                label.appendChild(check);
                label.appendChild(document.createTextNode(clanList.clanName));
                modalList.appendChild(li);
            });
        } else { //マイオブジェクトボタンを押されたらmodalの中身をマイオブジェクト選択に変更
            modalList.innerHTML = '';
            modalTitle.innerText = 'マイオブジェクトから選択';
            objectList.forEach(object => {
                const li = document.createElement('li');
                const div = document.createElement('div');

                div.classList.add('my-object-item');
                div.appendChild(document.createTextNode(objectList.objectURL));

                li.appendChild(div);
                modalList.appendChild(li);
            });
        };
    });
});
