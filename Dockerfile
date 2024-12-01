FROM debian:bookworm-slim as base

RUN apt update ; apt upgrade

RUN curl -fsSL https://deno.land/install.sh | sh

FROM base as starter

WORKDIR /starter

COPY packages/start . 

RUN deno install

FROM base as interface

FROM base as final

# Install caddy, as per installation instructions: https://caddyserver.com/docs/install#debian-ubuntu-raspbian
RUN apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
RUN curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
RUN curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
RUN apt update
RUN apt install caddy

