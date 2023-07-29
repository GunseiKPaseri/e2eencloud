# Tiny Server

Server implemented in Deno

## how to develop

### 1. initialize DB (first time only)
```shell-session
$ deno task prisma:gen
$ deno task prisma:mgdev
$ deno task prisma:seed
```

### 3. run server

```shell-session
# ----End of First time only
$ deno task server
```

## lint

```shell-session
$ deno lint
Checked 30 files
```

## format

```shell-session
$ deno fmt
Checked 36 files
```

## DB

### When Schema changed

```shell-session
$ deno task prisma:gen
$ deno task prisma:mgdev
```

### migrate

```shell-session
$ deno task migrate
...
```

### rollback

```shell-session
$ deno task rollback
...
```

## lock

Add lock information when dependent packages are changed

```shell-session
$ deno task checkdependent
```

## devcontainer

- [app.localhost] Deno app (main)
- [mailer.localhost] MailDev Dashboard
- [dashboard.localhost] Traefik Dashboard (reverse proxy)
- [minio.localhost] MinIO Dashboard (S3 like)
- [phpmyadmin.localhost] PHP MyAdmin (DB)
