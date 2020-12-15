function toggleNav() {
    const body = document.body;
    const hamburger = document.getElementById('js-hamburger');
    const blackBg = document.getElementById('js-black-bg');
    const lines = document.querySelectorAll('.hamburger__line');

    hamburger.addEventListener('click', function() {
        body.classList.toggle('nav-open');
    });
    blackBg.addEventListener('click', function() {
        body.classList.remove('nav-open');
    });

    if(body.classList.contains('camera-page') === true ){ //カメラページならハンバーガーメニューの色を変更
        hamburger.classList.add('hamburger--white');
        lines.forEach(line => {
            line.classList.add('hamburger--white__line');
        });
    };
};

toggleNav();