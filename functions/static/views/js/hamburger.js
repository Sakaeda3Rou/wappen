const body = document.body;
const logout = document.querySelector('.global-nav__logout');

function hamburgerMove() {
    body.classList.toggle('nav-open');
    logout.classList.toggle('global-nav__logout--active');
};
function hamburgerBgRemove() {
    body.classList.remove('nav-open');
    logout.classList.toggle('global-nav__logout--active');
};
