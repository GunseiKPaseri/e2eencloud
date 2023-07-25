#! /bin/bash
set -x
cd `dirname $0`

# remove container・volume
docker compose -f ./docker-compose.yml -f ./docker-compose.build.yml down -v

# load .env
docker compose \
    -f ./docker-compose.yml -f ./docker-compose.build.yml \
    run --rm apiserver \
    bash -c "cd /e2eencloud/tinyserver && deno task prisma:gen"
docker compose -f ./docker-compose.yml -f ./docker-compose.build.yml down

# # migrate
docker compose -f ./docker-compose.yml -f ./docker-compose.build.yml up -d
docker compose \
    -f ./docker-compose.yml -f ./docker-compose.build.yml \
    exec apiserver \
    bash -c "cd /e2eencloud/tinyserver && sleep 20 && deno task prisma:mgdev"
docker compose -f ./docker-compose.yml -f ./docker-compose.build.yml down

# # seed
docker compose -f ./docker-compose.yml -f ./docker-compose.build.yml up -d
docker compose \
    -f ./docker-compose.yml -f ./docker-compose.build.yml \
    exec apiserver \
    bash -c "cd /e2eencloud/tinyserver && sleep 20 && deno task prisma:seed"

