FROM denoland/deno:alpine-2.1.4

WORKDIR /app

# Set permissions before switching to deno user
COPY . .
RUN chown -R deno:deno /app

# Switch to deno user after setting permissions
USER deno

RUN deno cache src/index.ts

CMD ["deno", "run", "-A", "src/index.ts"]
