FROM hayd/alpine-deno:1.7.2

expose 8080

WORKDIR /app

USER deno

COPY deps.ts .
RUN deno cache deps.ts

COPY . .
RUN deno cache main.ts

CMD ["run", "--unstable", "--allow-net", "--allow-read", "--allow-env", "main.ts"]
