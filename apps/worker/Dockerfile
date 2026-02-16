FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
RUN npm install -g turbo
WORKDIR /app
COPY . .
RUN turbo prune worker --docker

FROM base AS installer
WORKDIR /app
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY --from=builder /app/out/full/ .
RUN cd packages/database && npx prisma generate
RUN pnpm turbo run build --filter=worker...

FROM node:20-alpine AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 workeruser

COPY --from=installer --chown=workeruser:nodejs /app .
USER workeruser

CMD ["node", "apps/worker/dist/index.js"]
