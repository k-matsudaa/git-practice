// node_modulesからdate-fnsのformat関数、add関数をインポート
import { format, add } from 'date-fns';

// 1. 今日の生のデータを取得
const today = new Date();

// 2. 先に「1ヶ月後」の計算をする（まだ生のデータの状態）
const oneMonthLater = add(today, { months: 1 });

// 3. 計算が終わったデータを、最後にきれいな文字列にフォーマットする
const formattedDate = format(oneMonthLater, 'yyyy/MM/dd HH:mm:ss');

console.log(`一ヶ月後の日時は ${formattedDate} です。`);