const express = require('express');
const mysql = require('mysql2');
const app = express();
const PORT = 3000;

// ==========================================
// 【新設】ブラウザのフォームから送信された文字を受け取るための設定
// ==========================================
app.use(express.urlencoded({ extended: true }));

// ==========================================
// MySQL データベースへの接続設定
// ★変更点：コードに直接書かず、process.env から外出しで受け取る
// ==========================================
const connection = mysql.createConnection({
    host:     process.env.DB_HOST,     // docker-composeの「DB_HOST」から読み込む
    user:     process.env.DB_USER,     // docker-composeの「DB_USER」から読み込む
    password: process.env.DB_PASSWORD, // docker-composeの「DB_PASSWORD」から読み込む
    database: process.env.DB_NAME      // docker-composeの「DB_NAME」から読み込む
});

// ==========================================
// 1. 【参照（一覧＆フォーム）】メイン画面の表示
// ==========================================
app.get('/', (req, res) => {
    // 登録されているユーザーを全員引っ張ってくるSQL
    const sql = `
        SELECT users.user_id, users.name, users.email, subscriptions.plan_name, subscriptions.status 
        FROM users 
        LEFT JOIN subscriptions ON users.user_id = subscriptions.user_id
        ORDER BY users.user_id DESC
    `;

    connection.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('データベースエラーが発生しました。');
        }

        // 全員のデータをHTMLのテーブル（表）の行に変換する処理
        let userRows = '';
        results.forEach(user => {
            userRows += `
                <tr>
                    <td>${user.user_id}</td>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td>${user.plan_name || '未登録'}</td>
                    <td>${user.status || 'inactive'}</td>
                    <td>
                        <a href="/user/${user.user_id}" class="btn-select">個別参照</a>
                        <a href="/delete/${user.user_id}" class="btn-delete" onclick="return confirm('本当に削除しますか？')">削除</a>
                    </td>
                </tr>
            `;
        });

        // 画面（HTML）の出力
        res.send(`
            <!DOCTYPE html>
            <html lang="ja">
            <head>
                <meta charset="UTF-8">
                <title>最強のDocker-CRUDアプリ</title>
                <style>
                    body { font-family: sans-serif; text-align: center; margin: 30px auto; max-width: 800px; }
                    .form-section { background: #f4f4f4; padding: 20px; border-radius: 8px; margin-bottom: 30px; text-align: left; border: 1px solid #ccc; }
                    .form-group { margin-bottom: 10px; }
                    label { display: inline-block; width: 120px; font-weight: bold; }
                    input[type="text"], input[type="email"], select { padding: 5px; width: 250px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                    th { background-color: #28a745; color: white; }
                    tr:nth-child(even) { background-color: #f9f9f9; }
                    .btn-submit { background: #28a745; color: white; padding: 8px 15px; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; }
                    .btn-select { background: #007bff; color: white; padding: 3px 8px; text-decoration: none; border-radius: 4px; font-size: 0.9rem; }
                    .btn-delete { background: #dc3545; color: white; padding: 3px 8px; text-decoration: none; border-radius: 4px; font-size: 0.9rem; margin-left: 5px; }
                </style>
            </head>
            <body>
                <h1>ユーザー管理システム（CRUD機能搭載）</h1>

                <div class="form-section">
                    <h3>➕ 新規ユーザー登録</h3>
                    <form action="/add" method="POST">
                        <div class="form-group">
                            <label>ユーザーID:</label>
                            <input type="text" name="user_id" placeholder="例: 30" required>
                        </div>
                        <div class="form-group">
                            <label>名前:</label>
                            <input type="text" name="name" placeholder="例: John Doe" required>
                        </div>
                        <div class="form-group">
                            <label>メールアドレス:</label>
                            <input type="email" name="email" placeholder="例: john@example.com" required>
                        </div>
                        <div class="form-group">
                            <label>プラン名:</label>
                            <select name="plan_name">
                                <option value="Free">Free</option>
                                <option value="Pro">Pro</option>
                                <option value="Premium">Premium</option>
                            </select>
                        </div>
                        <button type="submit" class="btn-submit">登録を実行する</button>
                    </form>
                </div>

                <h3>👥 登録ユーザー一覧</h3>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>名前</th>
                            <th>メールアドレス</th>
                            <th>プラン</th>
                            <th>ステータス</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${userRows || '<tr><td colspan="6" style="text-align:center;">ユーザーがいません。</td></tr>'}
                    </tbody>
                </table>
            </body>
            </html>
        `);
    });
});

// ==========================================
// 2. 【追加（Create）】フォームから送信されたデータを保存
// ==========================================
app.post('/add', (req, res) => {
    // フォームに入力された文字をバラバラに取り出す
    const { user_id, name, email, plan_name } = req.body;

    // ① usersテーブルに保存するSQL
    const sqlUser = 'INSERT INTO users (user_id, name, email) VALUES (?, ?, ?)';
    // ② subscriptionsテーブルに保存するSQL（ID+100を仮のサブスクIDにする）
    const sqlSub = 'INSERT INTO subscriptions (subscription_id, user_id, plan_name, status) VALUES (?, ?, ?, ?)';

    // まずユーザーを保存
    connection.query(sqlUser, [user_id, name, email], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('ユーザー登録エラー。IDが重複している可能性があります。');
        }

        // 続けてサブスク情報を保存
        const subId = parseInt(user_id) + 100;
        connection.query(sqlSub, [subId, user_id, plan_name, 'active'], (err) => {
            if (err) console.error(err);
            
            // 保存が終わったら、トップ画面（/）に自動で戻る（リダイレクト）
            res.redirect('/');
        });
    });
});

// ==========================================
// 3. 【指定参照（Read）】特定のユーザーIDだけを個別表示＆変更フォーム
// ==========================================
app.get('/user/:id', (req, res) => {
    const targetId = req.params.id; // URLの末尾（:id）から数字を引っこ抜く

    const sql = `
        SELECT users.user_id, users.name, users.email, subscriptions.plan_name, subscriptions.status 
        FROM users 
        LEFT JOIN subscriptions ON users.user_id = subscriptions.user_id
        WHERE users.user_id = ?
    `;

    connection.query(sql, [targetId], (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).send('ユーザーが見つかりませんでした。<a href="/">戻る</a>');
        }

        const user = results[0];

        // 個別画面 ＆ 編集（Update）用のフォームを出す
        res.send(`
            <!DOCTYPE html>
            <html lang="ja">
            <head>
                <meta charset="UTF-8">
                <title>ユーザー詳細・編集</title>
                <style>
                    body { font-family: sans-serif; text-align: center; margin-top: 50px; }
                    .card { border: 2px solid #007bff; padding: 20px; width: 400px; margin: 0 auto; border-radius: 10px; text-align: left; background: #fdfdfd; }
                    .form-group { margin-bottom: 12px; }
                    label { display: inline-block; width: 100px; font-weight: bold; }
                    input[type="text"], input[type="email"] { padding: 5px; width: 250px; }
                    .btn-save { background: #007bff; color: white; padding: 8px 15px; border: none; border-radius: 4px; cursor: pointer; }
                    .link-back { display: block; margin-top: 20px; color: #666; }
                </style>
            </head>
            <body>
                <h1>🔍 ユーザーID: ${user.user_id} の詳細・編集</h1>
                
                <div class="card">
                    <form action="/update/${user.user_id}" method="POST">
                        <div class="form-group">
                            <label>名前:</label>
                            <input type="text" name="name" value="${user.name}" required>
                        </div>
                        <div class="form-group">
                            <label>メール:</label>
                            <input type="email" name="email" value="${user.email}" required>
                        </div>
                        <div class="form-group">
                            <label>プラン:</label>
                            <input type="text" name="plan_name" value="${user.plan_name}" required>
                        </div>
                        <p><strong>ステータス:</strong> ${user.status}</p>
                        <button type="submit" class="btn-save">変更を保存する（UPDATE）</button>
                    </form>
                </div>

                <a href="/" class="link-back">◀ 一覧画面に戻る</a>
            </body>
            </html>
        `);
    });
});

// ==========================================
// 4. 【変更（Update）】書き換えられたデータを保存する
// ==========================================
app.post('/update/:id', (req, res) => {
    const targetId = req.params.id;
    const { name, email, plan_name } = req.body; // 編集画面から届いた文字

    const sqlUser = 'UPDATE users SET name = ?, email = ? WHERE user_id = ?';
    const sqlSub = 'UPDATE subscriptions SET plan_name = ? WHERE user_id = ?';

    // usersテーブルを更新
    connection.query(sqlUser, [name, email, targetId], (err) => {
        if (err) console.error(err);

        // subscriptionsテーブルも更新
        connection.query(sqlSub, [plan_name, targetId], (err) => {
            if (err) console.error(err);
            
            // 更新が終わったら詳細画面（/user/ID）にリダイレクトして戻る
            res.redirect('/user/' + targetId);
        });
    });
});

// ==========================================
// 5. 【削除（Delete）】データを消去する
// ==========================================
app.get('/delete/:id', (req, res) => {
    const targetId = req.params.id;

    // 先に子テーブル(subscriptions)から消し、そのあと親(users)を消す（エラー防止のルール）
    const sqlSub = 'DELETE FROM subscriptions WHERE user_id = ?';
    const sqlUser = 'DELETE FROM users WHERE user_id = ?';

    connection.query(sqlSub, [targetId], (err) => {
        if (err) console.error(err);

        connection.query(sqlUser, [targetId], (err) => {
            if (err) console.error(err);
            
            // 削除が終わったらトップ画面に戻る
            res.redirect('/');
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});