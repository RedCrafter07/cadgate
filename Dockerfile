FROM debian:bookworm-slim as base

RUN apt update ; apt upgrade

RUN curl -fsSL https://deno.land/install.sh | sh

FROM base as starter

WORKDIR /starter

COPY packages/start . 

RUN deno install --node-modules-dir

FROM base as api

WORKDIR /api

COPY packages/api . 

RUN deno install --node-modules-dir

FROM base as interface

WORKDIR /interface

COPY packages/interface . 

RUN deno install --node-modules-dir --allow-scripts

RUN deno task build

FROM base as util

WORKDIR /util

COPY packages/util .

RUN deno install --node-modules-dir

FROM base as final

WORKDIR /cadgate

COPY --from=api /api ./api
COPY --from=interface /interface/build ./interface
COPY --from=start /start ./interface
COPY --from=util /util ./util

# Install caddy, as per installation instructions: https://caddyserver.com/docs/install#debian-ubuntu-raspbian
RUN apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
RUN curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
RUN curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
RUN apt update
RUN apt install caddy

ENV DATA_PATH = "/data"
ENV API_PATH="/cadgate/api/src/index.ts"
ENV INTERFACE_PATH="/cadgate/interface"
ENV API_URL="http://localhost:2000"

ENV DEV=false

CMD [ "deno", "run", "/cadgate/start/src/index.ts" ]