FROM denoland/deno:alpine-2.1.4

WORKDIR /app

COPY . .

RUN deno cache src/index.ts

USER deno

CMD ["deno", "run", "-A", "src/index.ts"]
