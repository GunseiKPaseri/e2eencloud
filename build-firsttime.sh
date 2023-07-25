#! /bin/bash
set -x
cd `dirname $0`

# remove container・volume
docker compose --project-name e2eencloud -f $(pwd)/docker-compose.yml -f $(pwd)/docker-compose.build.yml down -v

# load prisma gen
docker compose \
    --project-name e2eencloud \
    -f ./docker-compose.yml -f ./docker-compose.build.yml \
    run --rm apiserver \
    bash -c "cd /e2eencloud/tinyserver && deno task prisma:gen"
docker compose -f $(pwd)/docker-compose.yml -f $(pwd)/docker-compose.build.yml down

# migrate
docker compose -f $(pwd)/docker-compose.yml -f $(pwd)/docker-compose.build.yml up -d
docker compose \
    --project-name e2eencloud \
    -f $(pwd)/docker-compose.yml -f $(pwd)/docker-compose.build.yml \
    exec apiserver \
    bash -c "cd /e2eencloud/tinyserver && sleep 20 && deno task prisma:mgdev"
docker compose -f $(pwd)/docker-compose.yml -f $(pwd)/docker-compose.build.yml down

# seed
docker compose -f $(pwd)/docker-compose.yml -f $(pwd)/docker-compose.build.yml up -d
docker compose \
    --project-name e2eencloud \
    -f $(pwd)/docker-compose.yml -f $(pwd)/docker-compose.build.yml \
    exec apiserver \
    bash -c "cd /e2eencloud/tinyserver && sleep 20 && deno task prisma:seed"

