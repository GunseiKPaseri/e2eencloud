# E2EENCLOUD (α版)

E2E暗号化を実装したWebストレージアプリケーション

![web client picture](document/asset/e2eencloud.png)

## 動作方法

以下を**初回のみ**実行する
```shell-session
$ ./build-env.sh
$ ./build-firsttime.sh
$ ./build-frontend.sh
```
以下を実行する
```shell-session
$ docker compose up -d
```

[app.localhost]を開く

## ディレクトリ構造

### tinyserver

Deno製アプリケーションサーバ（app.localhost/api以下に提供されます。）

### webcli

クライアントSPA（開発用更新サーバ付き）

## テスト環境の立ち上げ

以下を**初回のみ**実行する
```shell-session
./build-env.sh
```

`tinyserver`・`webcli`それぞれでVSCode等を利用しdevcontainerを立ち上げる。

tinyserver側のコンテナで以下を実行
```shell-session
$ deno task prisma:gen
$ deno task prisma:mgdev
$ deno task prisma:seed
```

それぞれのサーバを立ち上げれば[app.localhost]から利用できる。（ローカルの80番ポートを開けておくこと）

