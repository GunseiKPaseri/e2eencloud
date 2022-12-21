FROM alpine/git AS clone
WORKDIR /clone

RUN git clone --depth 1 https://github.com/GunseiKPaseri/prisma-data-proxy-alt.git -b fix_for_compose .

FROM node:18-bullseye-slim AS base
RUN \
  --mount=type=cache,target=/var/lib/apt/lists \
  --mount=type=cache,target=/var/cache/apt/archives \
  apt-get update\
  && apt-get install -y tini ca-certificates

COPY --from=clone --chown=node:node /clone/package.json /app/package.json
COPY --from=clone --chown=node:node /clone/src/ /app/src/
COPY --from=clone --chown=node:node /clone/yarn.lock /app/yarn.lock
COPY --from=clone --chown=node:node /clone/tsconfig.json /app/tsconfig.json

RUN ls / -la

COPY ./entrypoint.sh /entrypoint.sh
RUN ls -la /entrypoint.sh
RUN chmod +x /entrypoint.sh

USER node

WORKDIR /app

RUN yarn install

ENV PRISMA_SCHEMA_PATH /app/prisma/schema.prisma
ENV DATABASE_URL postgresql://postgres:pass@db:5432/postgres?schema=public
ENV DATA_PROXY_API_KEY custometoken
ENV PORT "3000"

ENTRYPOINT ["/usr/bin/tini", "-s", "--", "/entrypoint.sh"]
CMD ["./dist/server.js"]
