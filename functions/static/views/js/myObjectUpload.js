const dropZone = document.getElementById('drop-zone');
const preview = document.getElementById('preview');
const fileInput = document.getElementById('file-input');
const title = document.querySelector('.drop__title');
const btn = document.querySelector('.drop__btn');

dropZone.addEventListener('dragover', function(e) {
    e.stopPropagation();
    e.preventDefault();
    this.style.background = '#e1e7f0';
}, false);

dropZone.addEventListener('dragleave', function(e) {
    e.stopPropagation();
    e.preventDefault();
    this.style.background = '#ffffff';
}, false);

fileInput.addEventListener('change', function () {
    previewFile(this.files[0]);
});

dropZone.addEventListener('drop', function(e) {
    e.stopPropagation();
    e.preventDefault();
    title.style.visibility = 'hidden';
    btn.style.visibility = 'hidden';
    this.style.opacity = 0;
    this.style.background = '#ffffff'; //背景色を白に戻す
    const files = e.dataTransfer.files; //ドロップしたファイルを取得
    if (files.length > 1) return alert('アップロードできるファイルは1つだけです。');
    fileInput.files = files; //inputのvalueをドラッグしたファイルに置き換える。
    previewFile(files[0]);
}, false);

function previewFile(file) {
    /* FileReaderで読み込み、プレビュー画像を表示。 */
    const fr = new FileReader();
    fr.readAsDataURL(file);
    fr.onload = function() {
        const img = document.createElement('img');
        img.setAttribute('src', fr.result);
        preview.innerHTML = '';
        preview.appendChild(img);
        img.id = 'drop-zone';
    };
}