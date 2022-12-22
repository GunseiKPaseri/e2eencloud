#! /bin/sh

HOGE=$DATABASE_URL
DATABASE_URL=$SHADOW_DATABASE_URL
deno run --unstable -A npm:prisma@^4.7.1 db push
DATABASE_URL=$HOGE
