#! /bin/bash
cd `dirname $0`
docker compose \
    -f ./docker-compose.yml -f ./docker-compose.dev.yml \
    run --rm frontenddevserver \
    bash -c "cd /e2eencloud/webcli && npm install && npm run build"
