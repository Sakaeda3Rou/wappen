// ページ作成
function createPage() {
  //ページ表示する領域を取得
  const page_area = document.getElementById('page_numbers');

  if (nowPage == maxPage) {
    // 現在のページと最大ページが等しい
    let i = 1;
    if (maxPage > 5) {
      i = maxPage - 4;
    }

    // maxPageが1より大きい場合、「<」ボタンを追加
    if (maxPage != 1) {
      const input_element = createInput('<', false);
      page_area.appendChild(input_element);
    }

    // inputタグの追加
    for (; i <= maxPage; i++) {

      // ボタンの設定
      let isDisabled = false;
      if (i == nowPage) {
        isDisabled = true
      }

      // inputタグを作成
      const input_element = createInput(i, isDisabled);

      // 表示領域に追加
      page_area.appendChild(input_element);
    }


  } else {
    // 現在のページと最大ページが等しくない

    // 現在ページが1より大きい場合、「<」ボタンを追加
    if (nowPage > 1) {
      const input_element = createInput('<', false);
      page_area.appendChild(input_element)
    }

    // 作成するページの範囲
    let start = null;
    let end = null;

    if (nowPage <= 3) {
      start = 1;
    } else {
      start = nowPage-2;
    }

    if (start + 5 > maxPage) {
      end = maxPage;
    } else {
      end = start+5;
    }

    // inputタグの追加
    for (let i = start; i <= end; i++) {

      // ボタンの設定
      let isDisabled = false
      if (start == nowPage) {
        isDisabled = true
      }

      // inputタグの作成
      const input_element = createInput(i, isDisabled);

      // 表示領域に追加
      page_area.appendChild(input_element);
    }

    // 現在のページが最大ページより小さい場合、「>」を追加
    if (nowPage < maxPage) {
      const input_element = createInput('>', false);
      page_area.appendChild(input_element);
    }

  }
}

function createInput(value, isDisabled) {
  const input_element = document.createElement('input');
  input_element.setAttribute('class', 'page__button');
  input_element.setAttribute('type', 'button');
  input_element.setAttribute('value', `${value}`);
  input_element.setAttribute('onclick', `pageSelected("${value}")`);
  input_element.disabled = isDisabled;

  return input_element;
}
