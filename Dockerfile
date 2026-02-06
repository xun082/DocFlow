FROM node:24-alpine AS base

RUN npm config set registry https://registry.npmmirror.com && \
    apk add --no-cache libc6-compat && \
    corepack enable && \
    corepack prepare pnpm@10.28.2 --activate && \
    pnpm config set registry https://registry.npmmirror.com

WORKDIR /app

# ─── Stage 1: Install all dependencies ───────────────────────────────
FROM base AS deps
COPY .npmrc package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/DocFlow/package.json ./apps/DocFlow/package.json
COPY packages/alert/package.json ./packages/alert/package.json
RUN pnpm install --frozen-lockfile --ignore-scripts

# ─── Stage 2: Build workspace packages & Next.js app ─────────────────
FROM base AS builder

ARG VERSION=unknown
ARG GIT_COMMIT=unknown

WORKDIR /app

# Copy installed dependencies (preserves pnpm workspace symlink structure)
COPY --from=deps /app ./

# Copy build configuration (tsconfig.base.json required by packages/* tsconfig extends)
COPY turbo.json tsconfig.base.json tsconfig.json tsconfig.build.json ./

# Copy source code (overlays on top; existing node_modules from deps are preserved)
# Only packages/alert needed for frontend; transformer is backend-only
COPY apps/ ./apps/
COPY packages/alert/ ./packages/alert/

# 构建时环境变量
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Build only DocFlow + @syncflow/alert (transformer excluded, backend-only)
RUN pnpm turbo run build --filter=DocFlow && \
    rm -rf apps/DocFlow/.next/cache

# ─── Stage 3: Production dependencies only ───────────────────────────
FROM base AS prod-deps
WORKDIR /app
COPY .npmrc package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/DocFlow/package.json ./apps/DocFlow/package.json
COPY packages/alert/package.json ./packages/alert/package.json
RUN pnpm install --frozen-lockfile --prod --ignore-scripts && \
    ( find node_modules -name "*.d.ts" -delete 2>/dev/null; \
      find node_modules -name "*.map" -delete 2>/dev/null; \
      find node_modules -name "README*" -delete 2>/dev/null; \
      find node_modules -name "CHANGELOG*" -delete 2>/dev/null; \
      find node_modules -name "*.md" ! -name "package.json" -delete 2>/dev/null; \
      find node_modules -name "LICENSE*" -delete 2>/dev/null; \
      find node_modules -type d -name "test" -exec rm -rf {} + 2>/dev/null; \
      find node_modules -type d -name "tests" -exec rm -rf {} + 2>/dev/null; \
      find node_modules -type d -name "__tests__" -exec rm -rf {} + 2>/dev/null; \
      find node_modules -type d -name "docs" -exec rm -rf {} + 2>/dev/null; \
      find node_modules -type d -name "examples" -exec rm -rf {} + 2>/dev/null; \
      true )

# ─── Stage 4: Final runtime image ────────────────────────────────────
FROM node:24-alpine AS runner

ARG VERSION=unknown
ARG GIT_COMMIT=unknown

WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# 镜像标签
LABEL org.opencontainers.image.title="DocFlow" \
      org.opencontainers.image.description="Modern collaborative document editing platform" \
      org.opencontainers.image.version="${VERSION}" \
      org.opencontainers.image.revision="${GIT_COMMIT}"

RUN apk add --no-cache libc6-compat && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy production dependencies (includes pnpm workspace symlink structure)
COPY --from=prod-deps --chown=nextjs:nodejs /app ./

# Copy built workspace packages (dist for workspace:* runtime resolution)
COPY --from=builder --chown=nextjs:nodejs /app/packages/alert/dist ./packages/alert/dist
COPY --from=builder --chown=nextjs:nodejs /app/packages/alert/src/alert.css ./packages/alert/src/alert.css

# Copy built Next.js app
COPY --from=builder --chown=nextjs:nodejs /app/apps/DocFlow/.next ./apps/DocFlow/.next
COPY --from=builder --chown=nextjs:nodejs /app/apps/DocFlow/public ./apps/DocFlow/public

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

WORKDIR /app/apps/DocFlow
CMD ["../../node_modules/.bin/next", "start"]
