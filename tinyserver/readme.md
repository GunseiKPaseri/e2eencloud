# Tiny Server

Denoで実装してみたサーバ

## how to move

### 1. set env (first time only)

Use _`.env` file_ OR _set environment variables_

The following commands can be used to generate passwords.

```bash
$ deno run .\gen_environment.ts > .env
```

You may prepare your own configuration file as follows.

```.env
# DB
DB_PORT = 13306
DB_NAME = e2eencloud
DB_USER = e2eencloudserver
DB_PASS = Lv_kDEbXPU1hpyZYt2oe-aaVm

TZ = Asia/Tokyo

# S3(or MinIO)
AWS_ACCESS_KEY_ID = fFKUfIDIirQ78yVlv3UzafDhT
AWS_SECRET_ACCESS_KEY = LRSOgFOzDrxmKvypKzNFcnBZY
AWS_DEFAULT_REGION = ap-northeast-1
AWS_BUCKET = e2eencloud-bucket-test
AWS_USE_PATH_STYLE_ENDPOINT = true
# URL IN AppNetwork(like docker)
AWS_ENDPOINT = http://minio:9000
# URL IN EndPoint(like browser)
AWS_URL = http://localhost:9000

# For DockerCompose Admin
L_DB_ROOT_PASS = bRxjUvpN6ZAxMc4VUuzJtCfgi
L_MINIO_PORT = 9000
L_MINIO_CONSOLE_PORT = 9001
L_MINIO_ROOT_USER = Admin
L_MINIO_ROOT_PASSWORD = bWfR6h7flV9rV55Yo5stabGQ3
```

On windows, change character encoding to UTF-8.

### 2. initialize (first time only)

_You should delete or change password `admin@example.com`, `testuser@example.com`_ ( See /db/seeds/users.ts )

```bash
# ----First time only
$ docker-compose up -d
$ deno run -A --unstable https://deno.land/x/nessie@2.0.6/cli.ts migrate
$ deno run -A --unstable https://deno.land/x/nessie@2.0.6/cli.ts seed
```

### 3. run server

```bash
# ----End of First time only
$ deno task server
```

## lint

```bash
$ deno lint
Checked 17 files
```

## format

```bash
$ deno fmt
Checked 20 files
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

## lock

```bash
$ deno cache --lock=lock.json --lock-write --unstable .\deps.ts
```
