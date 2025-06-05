# 使用最小的 Alpine 基础镜像
FROM node:20-alpine AS base
WORKDIR /app

# 安装 pnpm 和必要依赖，一次性完成
RUN apk add --no-cache libc6-compat && \
    corepack enable && \
    corepack prepare pnpm@9 --activate && \
    rm -rf /var/cache/apk/*

# 依赖安装阶段
FROM base AS deps
COPY package.json pnpm-lock.yaml .npmrc* ./
RUN pnpm install --frozen-lockfile --prefer-offline && \
    pnpm store prune

# 构建阶段
FROM base AS builder
COPY package.json pnpm-lock.yaml .npmrc* ./
RUN pnpm install --frozen-lockfile --prefer-offline
COPY . .
RUN pnpm build && \
    rm -rf .next/cache

# 生产依赖安装阶段（极限优化）
FROM base AS prod-deps
COPY package.json pnpm-lock.yaml .npmrc* ./
RUN pnpm install --frozen-lockfile --prod --prefer-offline && \
    pnpm store prune && \
    rm -rf /tmp/* ~/.pnpm-store && \
    # 极限清理 - 删除不必要的文件
    find node_modules -name "*.d.ts" -delete && \
    find node_modules -name "*.map" -delete && \
    find node_modules -name "README*" -delete && \
    find node_modules -name "CHANGELOG*" -delete && \
    find node_modules -name "*.md" -delete && \
    find node_modules -name "LICENSE*" -delete && \
    find node_modules -name "NOTICE*" -delete && \
    find node_modules -name ".github" -type d -exec rm -rf {} + 2>/dev/null || true && \
    find node_modules -name "test" -type d -exec rm -rf {} + 2>/dev/null || true && \
    find node_modules -name "tests" -type d -exec rm -rf {} + 2>/dev/null || true && \
    find node_modules -name "__tests__" -type d -exec rm -rf {} + 2>/dev/null || true && \
    find node_modules -name "spec" -type d -exec rm -rf {} + 2>/dev/null || true && \
    find node_modules -name "docs" -type d -exec rm -rf {} + 2>/dev/null || true && \
    find node_modules -name "examples" -type d -exec rm -rf {} + 2>/dev/null || true && \
    find node_modules -name "demo" -type d -exec rm -rf {} + 2>/dev/null || true && \
    find node_modules -name "*.tgz" -delete && \
    find node_modules -name "*.tar.gz" -delete

# 最终运行阶段 - 极限优化
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# 只安装运行时必需的依赖
RUN apk add --no-cache libc6-compat && \
    corepack enable && \
    corepack prepare pnpm@9 --activate && \
    rm -rf /var/cache/apk/* && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# 从构建阶段复制优化后的文件
COPY --from=prod-deps --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

USER nextjs

EXPOSE 3000

CMD ["pnpm", "start"]
