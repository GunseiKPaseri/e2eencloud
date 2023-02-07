#!/bin/sh
set -e

mkdir -p dist
touch ./dist/server.js
chmod +x ./dist/server.js

mkdir -p prisma

ls ./prisma-original/schema.prisma | entr -nr /onchange.sh "$@"
