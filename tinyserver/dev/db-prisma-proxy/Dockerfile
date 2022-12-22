# build entr
FROM ubuntu:focal-20221130 as buildentr
WORKDIR /entr

RUN \
  apt-get update \
  && apt-get install -y \
    git \
    make \
    gcc

RUN git clone --depth 1 https://github.com/eradman/entr.git -b 5.2 .
RUN ./configure
RUN make test
RUN make install

# clone prisma-data-proxy-alt (fork)
FROM alpine/git AS clone
WORKDIR /clone

RUN git clone --depth 1 https://github.com/GunseiKPaseri/prisma-data-proxy-alt.git -b fix_for_compose .

# set up
FROM node:18-bullseye-slim AS base
RUN \
  --mount=type=cache,target=/var/lib/apt/lists \
  --mount=type=cache,target=/var/cache/apt/archives \
  apt-get update \
  && apt-get install -y tini ca-certificates

COPY --from=buildentr /usr/local/bin /usr/local/bin

COPY --from=clone --chown=node:node /clone/package.json /app/package.json
COPY --from=clone --chown=node:node /clone/src/ /app/src/
COPY --from=clone --chown=node:node /clone/yarn.lock /app/yarn.lock
COPY --from=clone --chown=node:node /clone/tsconfig.json /app/tsconfig.json

RUN ls / -la

COPY ./entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

COPY ./onchange.sh /onchange.sh
RUN chmod +x /onchange.sh

USER node

WORKDIR /app

RUN yarn install

ENV PRISMA_SCHEMA_PATH /app/prisma/schema.prisma
ENV DATABASE_URL postgresql://postgres:pass@db:5432/postgres?schema=public
ENV DATA_PROXY_API_KEY custometoken
ENV PORT "3000"

ENV ENTR_INOTIFY_WORKAROUND 1

ENTRYPOINT ["/usr/bin/tini", "-s", "--", "/entrypoint.sh"]
CMD ["./dist/server.js"]
