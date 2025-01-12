FROM debian:bookworm-slim AS base

# Install dependencies.
# Installation instructions used for Caddy: https://caddyserver.com/docs/install#debian-ubuntu-raspbian

RUN apt update && \
	apt upgrade && \
	apt install -y curl unzip && \
    apt install -y debian-keyring debian-archive-keyring apt-transport-https curl && \
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg && \
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list && \
	curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - && \
	apt update && \
	apt install -y nodejs caddy && \ 
	curl -fsSL https://deno.land/install.sh | sh && cp /root/.deno/bin/deno /usr/local/bin/deno && \
	groupadd -r cadgate && \
    useradd -r -g cadgate cadgate && \
    mkdir -p /data && \
    chown -R cadgate:cadgate /data && \
    chmod 755 /data

FROM base AS interface

WORKDIR /interface
COPY packages/interface . 
RUN deno install --node-modules-dir --allow-scripts
RUN deno task build

FROM base AS api

WORKDIR /api
COPY packages/api . 
RUN deno cache src/index.ts --node-modules-dir

FROM base AS util

WORKDIR /util
COPY packages/util .
RUN deno cache *.ts --node-modules-dir

FROM base AS starter

WORKDIR /starter
COPY packages/start . 
RUN deno cache src/index.ts --node-modules-dir

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
EXPOSE 2080

WORKDIR /cadgate/start

USER cadgate

HEALTHCHECK --interval=30s --timeout=3s \
    CMD curl -f http://localhost:2080/ || exit 1

CMD [ "deno", "run", "-A", "src/index.ts" ]