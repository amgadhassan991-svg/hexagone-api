# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:24-alpine AS builder

# Enable pnpm via corepack (matches workspace version)
RUN corepack enable && corepack prepare pnpm@10.26.1 --activate

WORKDIR /workspace

# Copy workspace manifests first for better layer caching.
# pnpm install needs the full workspace layout, so all package dirs are copied.
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml \
     tsconfig.base.json tsconfig.json ./

# Copy all workspace packages (node_modules excluded via .dockerignore)
COPY lib/ lib/
COPY artifacts/api-server/ artifacts/api-server/
COPY scripts/ scripts/

# Install all dependencies (dev included — needed for esbuild)
RUN pnpm install --frozen-lockfile

# Compile the API server into a single ESM bundle via esbuild
RUN pnpm --filter @workspace/api-server run build

# Extract a clean production-only dependency directory.
# pnpm deploy resolves workspace:* packages and installs only prod deps,
# giving us the exact node_modules the bundle's external imports need.
RUN pnpm --filter @workspace/api-server deploy --prod /deploy


# ── Stage 2: Production image ─────────────────────────────────────────────────
FROM node:24-alpine AS runner

WORKDIR /app

# Runtime externals (zod, @google/genai) from the deploy stage
COPY --from=builder /deploy/node_modules ./node_modules

# The compiled bundle + pino worker shims
COPY --from=builder /workspace/artifacts/api-server/dist ./dist

ENV NODE_ENV=production

# PORT is injected by Render / Railway at runtime — do not hardcode it
EXPOSE 8080

CMD ["node", "--enable-source-maps", "./dist/index.mjs"]
