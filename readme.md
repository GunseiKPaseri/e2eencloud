# E2EENCLOUD (α版)

E2E暗号化を実装したWebストレージアプリケーション

![web client picture](document/asset/e2eencloud.png)

## tinyserver

Deno製アプリケーションサーバ

## webcli

クライアントアプリケーション

## テスト環境の立ち上げ
最初に`tinyserver`を参考に`.env`を作成する

次に`docker compose`で立ち会げる
```
docker compose -f docker-compose.yml -f docker-compose.dev.yml up
```
または`tinyserver`・`webcli`それぞれでVSCode等を利用しdevcontainerを立ち上げる。
それぞれのサーバを立ち上げれば[app.localhost]から利用できる。
