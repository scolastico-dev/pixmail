FROM node:24-alpine AS pnpm
RUN npm install -g pnpm

FROM pnpm AS build-api-stage
WORKDIR /app
COPY api .
RUN pnpm install
RUN pnpm build
RUN pnpm prune --prod

FROM pnpm AS build-ui-stage
WORKDIR /app
COPY ui .
RUN pnpm install
RUN pnpm generate

FROM pnpm
WORKDIR /app

COPY --from=build-api-stage /app/dist .
COPY --from=build-api-stage /app/node_modules ./node_modules
COPY --from=build-ui-stage /app/.output/public ./public
COPY LICENSE .

EXPOSE 4000
ENV NODE_ENV=production
LABEL org.opencontainers.image.source=https://github.com/scolastico-dev/pixmail
LABEL org.opencontainers.image.title="pixmail"
LABEL org.opencontainers.image.description="Pixmail is your email tracking solution."
LABEL org.opencontainers.image.authors="Joschua Becker EDV <support@scolasti.co>"
STOPSIGNAL SIGKILL

CMD ["node", "src/main.js"]
