#!/bin/sh
set -e

mkdir -p dist
touch ./dist/server.js
chmod +x ./dist/server.js

mkdir -p prisma

cat ./prisma-original/schema.prisma \
    | grep -v "previewFeatures" \
    | grep -v "../generated/client" \
    > ./prisma/schema.prisma

yarn prisma generate

yarn run build

exec "$@"
