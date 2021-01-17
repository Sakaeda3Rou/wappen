// カテゴリ検索のチェックボックスが変更された時
function searchCategorySwitch(index) {

  categoryList[index].isSearchSelected = !(categoryList[index].isSearchSelected)

  // カテゴリアイテムを表示する領域を取得
  const search_area = document.getElementById('search_area');

  if (categoryList[index].isSearchSelected) {
    // チェックされた

    // divを作成
    const div_element = document.createElement('div');
    div_element.setAttribute('id', `${categoryList[index].categoryId}`);
    div_element.setAttribute('class', 'search__category-item');
    div_element.innerHTML = `${categoryList[index].categoryName}`;

    // 表示領域に追加
    search_area.appendChild(div_element);

  } else {
    // チェックが外れた
    try {
      // カテゴリアイテムを取得
      const category_item_element = document.getElementById(`${categoryList[index].categoryId}`);

      // カテゴリアイテムを削除
      category_item_element.remove();

    } catch {}
  }

  console.log(`categoryList {index: ${index},categoryID: ${categoryList[index].categoryId}, categoryName: ${categoryList[index].categoryName}, isSearchSelected: ${categoryList[index].isSearchSelected}}`);
}

// 検索ボタンにclickイベントを追加
let search_btn = document.getElementById('search_btn');

// 検索ボタンを押した時
search_btn.addEventListener('click', () => {

  // 検索するカテゴリリストを作成
  let searchCategoryList = [];

  for (let category of categoryList) {
    if (category.isSearchSelected) {
      searchCategoryList.push(category.categoryId);
    }
  }

  // カテゴリリストが空の場合、アラートを表示
  if (searchCategoryList.length == 0) {
    window.alert('カテゴリが選択されていません。');
    return;
  }

  // formを取得
  const form_element = document.getElementById('search_object');

  // リクエストボディを作成
  const request_body = {searchCategoryList: searchCategoryList};

  // text要素を作成
  const text_element = document.createElement('input');
  text_element.hidden = true;
  text_element.setAttribute('name', '_request_body');
  text_element.setAttribute('value', JSON.stringify(request_body));
  form_element.appendChild(text_element);

  // formを送信
  form_element.submit();

}, false);
