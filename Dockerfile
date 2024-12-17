FROM debian:bookworm-slim AS base

RUN apt update
RUN apt upgrade
RUN apt install -y curl unzip

# Install caddy, as per installation instructions: https://caddyserver.com/docs/install#debian-ubuntu-raspbian
RUN apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
RUN curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
RUN curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
RUN apt update
RUN apt install caddy

RUN curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -

RUN apt install -y nodejs

RUN curl -fsSL https://deno.land/install.sh | sh && cp /root/.deno/bin/deno /usr/local/bin/deno

FROM base AS starter

WORKDIR /starter

COPY packages/start . 

RUN deno install --node-modules-dir

FROM base AS api

WORKDIR /api

COPY packages/api . 

RUN deno install --node-modules-dir

FROM base AS interface

WORKDIR /interface

COPY packages/interface . 

RUN deno install --node-modules-dir --allow-scripts

RUN deno task build

FROM base AS util

WORKDIR /util

COPY packages/util .

RUN deno install --node-modules-dir

FROM base AS final

WORKDIR /cadgate

COPY --from=api /api ./api
COPY --from=interface /interface/build ./interface
COPY --from=starter /starter ./start
COPY --from=util /util ./util

ENV DATA_PATH="/data"
ENV API_PATH="/cadgate/api/src/index.ts"
ENV INTERFACE_PATH="/cadgate/interface"
ENV API_URL="http://localhost:2000"

ENV DEV=false

EXPOSE 80
EXPOSE 443
EXPOSE 5173

CMD [ "deno", "run", "-A", "/cadgate/start/src/index.ts" ]