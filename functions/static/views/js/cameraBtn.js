const cameraBtns = document.querySelectorAll('.js-btn');
const modalTitle = document.getElementById('modal__title');
const modalList = document.getElementById('modal__list');

cameraBtns.forEach(btn => {
    btn.addEventListener('click', () => { //js-btn一つ一つにclickイベントを設定
        if(btn.classList.contains('btns__btn--clan') === true){　//クラン選択ボタンを押されたらモーダルの中身をクラン選択に変更

            // クラン選択
            selectType = 0;

            modalList.innerHTML = '';
            modalTitle.innerText = '表示するクランを選択';
            clanList.forEach(clan => {
                const li = document.createElement('li');
                const check = document.createElement('input');
                const label = document.createElement('label');
                check.setAttribute('type', 'radio');
                check.setAttribute('name', 'clanRadio');
                check.setAttribute('value', `${clan.clanId}`);

                li.appendChild(label);
                label.appendChild(check);
                label.appendChild(document.createTextNode(clan.clanName));
                modalList.appendChild(li);
            });
        } else { //マイオブジェクトボタンを押されたらmodalの中身をマイオブジェクト選択に変更

            // オブジェクト選択
            selectType = 1;

            modalList.innerHTML = '';
            modalTitle.innerText = 'マイオブジェクトから選択';
            objectList.forEach(object => {
                const li = document.createElement('li');
                const div = document.createElement('div');

                div.classList.add('my-object-item');
                div.setAttribute('style', `background-image: url("${object.objectURL}")`);
                div.appendChild(document.createTextNode(object.objectId));

                li.appendChild(div);
                modalList.appendChild(li);
            });
        };
    });
});
