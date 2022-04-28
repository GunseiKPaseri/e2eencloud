# Tiny Server

Denoで実装してみたサーバ

## how to move

### 1. set env (first time only)

Use _`.env` file_ OR _set environment variables_

```.env
# mysql
DB_HOSTNAME = localhost
DB_PORT = 13306
DB_NAME = e2ee
DB_USER = e2eeserver
DB_PASS = Hoge0123

TZ = Asia/Tokyo
```

### 2. run server

```bash
# ----First time only
$ docker-compose up -d
$ deno run -A --unstable https://deno.land/x/nessie@2.0.6/cli.ts migrate
# ----End
$ deno run --allow-env --allow-net --allow-read --allow-write --unstable main.ts
server has started on http://localhost:3001 🚀
```

## lint

```bash
$ deno lint --config ./deno.jsonc
Checked 11 files
```

## format

```bash
$ deno fmt --config ./deno.jsonc
Checked 14 files
```

## test

```bash
$ deno test --allow-net --allow-read --allow-write
...
```

## DB

### migrate

```bash
$ deno run -A --unstable https://deno.land/x/nessie@2.0.6/cli.ts migrate
...
```

### rollback

```bash
$ deno run -A --unstable https://deno.land/x/nessie@2.0.6/cli.ts rollback
...
```
