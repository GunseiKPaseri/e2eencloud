# Tiny Server

Denoで実装してみたサーバ

```bash
$ docker-compose up -d
$ deno run --allow-net --allow-read --allow-write --unstable main.ts
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
$ deno run -A --unstable https://deno.land/x/nessie/cli.ts migrate
...
```

### rollback

```bash
$ deno run -A --unstable https://deno.land/x/nessie/cli.ts rollback
...
```
