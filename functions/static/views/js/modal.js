const btns = document.querySelectorAll('.js-btn');
const modal = document.querySelector('.js-modal');
const bg = document.querySelector('.js-bg');

btns.forEach(btn => {
    btn.addEventListener('click', () => {
        modal.classList.toggle('open');
    });
});

bg.addEventListener('click', () => {
    modal.classList.remove('open');
});