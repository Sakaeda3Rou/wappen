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
