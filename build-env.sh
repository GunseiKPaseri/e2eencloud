#! /bin/bash

# gen .env
docker run --name e2ee_initialize \
    --rm \
    --mount "type=bind,source=$(pwd),target=/e2eencloud" \
    denoland/deno:1.35.2 \
    bash -c "cd /e2eencloud/tinyserver && deno task init"
