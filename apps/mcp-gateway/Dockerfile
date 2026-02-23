# ─── Base ─────────────────────────────────────────────
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# ─── Prune (Solo copia lo necesario para 'mcp-gateway') ──
FROM base AS builder
RUN npm install -g turbo
WORKDIR /app
COPY . .
RUN turbo prune mcp-gateway --docker

# ─── Install dependencies ────────────────────────────
FROM base AS installer
WORKDIR /app
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts
COPY --from=builder /app/out/full/ .
RUN pnpm turbo run build --filter=mcp-gateway...

# ─── Runner ──────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 mcpuser

COPY --from=installer --chown=mcpuser:nodejs /app .
USER mcpuser

EXPOSE 3100
CMD ["node", "apps/mcp-gateway/dist/index.js"]
