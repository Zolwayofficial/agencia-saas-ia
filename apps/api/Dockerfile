# ─── Base ─────────────────────────────────────────────
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# ─── Prune (Solo copia lo necesario para 'api') ──────
FROM base AS builder
RUN npm install -g turbo
WORKDIR /app
COPY . .
RUN turbo prune api --docker

# ─── Install dependencies ────────────────────────────
FROM base AS installer
WORKDIR /app
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY --from=builder /app/out/full/ .
RUN pnpm turbo run build --filter=api...

# ─── Runner ──────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 apiuser

COPY --from=installer --chown=apiuser:nodejs /app .
USER apiuser

EXPOSE 3001
CMD ["node", "apps/api/dist/server.js"]
