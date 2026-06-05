// node_modulesからdate-fnsのformat関数をインポート
import { format } from 'date-fns';

const today = new Date();

// 日付を 'yyyy/MM/dd HH:mm:ss' 形式にフォーマットする
const formattedDate = format(today, 'yyyy/MM/dd HH:mm:ss');

console.log(`現在の日時は ${formattedDate} です。`);