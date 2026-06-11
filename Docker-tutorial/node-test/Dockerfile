# 1. ベースとなるイメージを指定
FROM node:20

# 2. コンテナ内の作業部屋を「/app」にする
WORKDIR /app

# 3. 注文書（package.jsonとpackage-lock.json）を先にコンテナ内にコピーする
COPY package.json package-lock.json* ./

# 4. 設計図（Dockerfile）のビルド時に npm ci を実行してパッケージをインストール
RUN npm ci

# 5. 残りのプログラムファイル（server.jsなど）をコンテナ内にコピー
COPY . .