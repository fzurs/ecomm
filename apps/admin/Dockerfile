# The admin in production (docs/production.md, deploy/compose.yml). Build context: the repo root
# (it uses packages/*): docker build -f apps/admin/Dockerfile .

FROM node:24-slim AS base
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable

# Only the admin and the packages it uses, with their slice of the lockfile.
FROM base AS prune
WORKDIR /repo
COPY . .
RUN pnpm dlx turbo@2.5.8 prune admin --docker

FROM base AS build
WORKDIR /repo
COPY --from=prune /repo/out/json/ .
RUN pnpm install --frozen-lockfile
COPY --from=prune /repo/out/full/ .
# Read at build time: the rewrites to Django and next/image's allowed host (next.config.mjs).
ARG API_URL
ARG MEDIA_URL
RUN test -n "$API_URL" && test -n "$MEDIA_URL" && pnpm --filter admin build

FROM node:24-slim
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000
RUN useradd --system --uid 10001 --create-home --home-dir /app app
WORKDIR /app
COPY --from=build --chown=app:app /repo/apps/admin/.next/standalone ./
COPY --from=build --chown=app:app /repo/apps/admin/.next/static ./apps/admin/.next/static
# next/image's cache: a volume, so it outlives deploys.
RUN mkdir -p apps/admin/.next/cache/images && chown -R app:app apps/admin/.next/cache
USER app
EXPOSE 3000
CMD ["node", "apps/admin/server.js"]
