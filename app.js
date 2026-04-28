//./math-cjs.jsファイルからエクスポートされたオブジェクトを読み込む
//const math = require('./math-cjs.js');

//const result1 = math.add(5,3);
//console.log(`5 + 3 = ${result1}`);//5 + 3 = 8

//const result2 = math.subtract(10,4);
//console.log(`10 - 4 = ${result2}`);//10 - 4 = 6
//./math-esm.jsファイルから指定した機能をインポートする
//ESMでは拡張子.jsまで書くのが一般的
//import{add,subtract}from'./math-esm.js';

//const result1 = add(5,3);
//console.log(`5 + 3 = ${result1}`);//5 + 3 = 8

//const result2 = subtract(10,4);
//console.log(`10 - 4 = ${result2}`);//10 - 4 = 6

//node_modulesからdate-fnsのformat関数をインポート
import{format}from'date-fns';

const today = new Date();

//日付を'yyyy/MM/dd HH:mm:ss'形式にフォーマットする
const formattedDate = format(today,'yyyy/MM/dd HH:mm:ss');

console.log(`現在の日時は${formattedDate}です。`); 
