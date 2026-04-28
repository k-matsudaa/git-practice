import axios from "axios";

// 1. awaitを使うために、全体を async 関数で囲みます
async function start() {
  try {
    // 2. await を付けることで、通信が終わるまでここで待機します
    const response = await axios.get("https://corp.glad-cube.com/");

    // 3. 終わった後のデータ（response.data）を表示します
    console.log(response.data); 
  } catch (error) {
    console.error("エラーが発生しました:", error.message);
  }
}

start();
