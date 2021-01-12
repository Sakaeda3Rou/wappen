function toggleNav() {
    const body = document.body;
    const hamburger = document.getElementById('js-hamburger');
    const blackBg = document.getElementById('js-black-bg');
    const lines = document.querySelectorAll('.hamburger__line');
    const logout = document.querySelector('.global-nav__logout');

    hamburger.addEventListener('click', function() {
        body.classList.toggle('nav-open');
        logout.classList.toggle('global-nav__logout--active');
    });
    blackBg.addEventListener('click', function() {
        body.classList.remove('nav-open');
        logout.classList.toggle('global-nav__logout--active');
    });

    if(body.classList.contains('camera-page') === true ){ //カメラページならハンバーガーメニューの色を変更
        hamburger.classList.add('hamburger--white');
        lines.forEach(line => {
            line.classList.add('hamburger--white__line');
        });
    };
};

toggleNav();
