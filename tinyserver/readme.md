# Tiny Server

Denoで実装してみたサーバ

```bash
$ docker-compose up -d
$ deno run --allow-net --allow-read --allow-write main.ts
server has started on http://localhost:3001 🚀
```

## lint

```bash
$ deno lint --config ./deno.jsonc
Checked 10 files
```

## format

```bash
$ deno fmt --config ./deno.jsonc
Checked 13 files
```

## test

```bash
$ deno test --allow-net --allow-read --allow-write
...
```
