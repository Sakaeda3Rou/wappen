export class Category {
    constructor() {
        this.category = ['なし','カルチャー','オリジナル','少年','少女','大人向け','季節','かっこいい','かわいい','映える','動物','植物'];
        // this.forCategory = category;
    }

    addCategory(forCategory) {
        let i = 0;
        forCategory.forEach(element => {
            const value = '<label><input type="checkbox">' + this.category[i] + '</label>';
            element.innerHTML = value;
            i++
        });
    }
};