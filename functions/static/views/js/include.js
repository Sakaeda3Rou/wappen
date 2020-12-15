const includeHamburger = () => {
    let xhr = new XMLHttpRequest(),
        method = "GET",
        url = "views/partials/hamburger.ejs";

    let hamburger = document.getElementById('set-hamburger');

    xhr.open(method, url, true);
    xhr.onreadystatechange = function () {
        if(xhr.readyState === 4 && xhr.status === 200){
            let restxt = xhr.responseText;
            hamburger.innerHTML= restxt;
        }
    };
    xhr.send();
    let script = document.createElement('script');
    script.src = 'views/js/hamburger.js';
    hamburger.appendChild(script);
}

const includeFooter = () => {
    let xhr = new XMLHttpRequest(),
        method = "GET",
        url = "views/partials/footer.ejs";

    let footer = document.getElementById('footer');

    xhr.open(method, url, true);
    xhr.onreadystatechange = function () {
        if(xhr.readyState === 4 && xhr.status === 200){
            let restxt = xhr.responseText;
            footer.innerHTML = restxt;
        }
    };
    xhr.send();
}

includeHamburger();
includeFooter();
