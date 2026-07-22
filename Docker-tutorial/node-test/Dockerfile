# 1. ベースとなるイメージを指定
FROM node:20

# 2. コンテナ内の作業部屋を「/app」にする
WORKDIR /app

# 3. 注文書（package.jsonとpackage-lock.json）を先にコンテナ内にコピーする
COPY package.json package-lock.json* ./

# 4. 設計図（Dockerfile）のビルド時に npm ci を実行してパッケージをインストール
RUN npm install

# 5. 残りのプログラムファイル（server.jsなど）をコンテナ内にコピー
COPY . .

# ★追加：エラーが起きてもnodemonが止まらずに再試行するようにする設定
ENV NODEMON_RESTART_ON_CRASH=true