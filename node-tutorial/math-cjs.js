//足し算をする関数
const add = (a,b) => a + b;

//引き算をする関数
const subtract = (a,b) => a - b;

//作成した関数を他のファイルで使えるようにエクスポートする
module.exports = {
 add,
 subtract
};
