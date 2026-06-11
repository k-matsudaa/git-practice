const express = require('express');
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
    // 現在の日本時間を取得して読みやすい文字にする
    const now = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });

    // 画面に表示するHTML（now を埋め込んでいます）
    res.send(`
        <h1>こんにちは！Node.jsサーバーから配信しています！</h1>
        <p>現在の時刻（日本時間）は <strong>${now}</strong> です。</p>
    `);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});