# ---------- BUILD STAGE ----------
# Node.js 22 Alpine = small base image
FROM node:22-alpine AS build

# Work inside /app
WORKDIR /app

# Enable pnpm
RUN corepack enable

# Copy workspace configuration and lockfile
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./

# Copy package.json files first for better Docker caching
COPY apps/auth-service/package.json apps/auth-service/package.json
COPY packages/shared-rabbitmq/package.json packages/shared-rabbitmq/package.json
COPY packages/shared-redis/package.json packages/shared-redis/package.json

# Install all dependencies including dev dependencies
RUN pnpm install --frozen-lockfile --prod=false

# Copy Auth Service source
COPY apps/auth-service apps/auth-service

# Copy shared package source
COPY packages/shared-rabbitmq packages/shared-rabbitmq
COPY packages/shared-redis packages/shared-redis

# Generate Prisma Client
RUN pnpm --filter auth-service exec prisma generate

# Compile shared packages from TypeScript to JavaScript
RUN pnpm exec tsc -p packages/shared-rabbitmq/tsconfig.json
RUN pnpm exec tsc -p packages/shared-redis/tsconfig.json

# Compile Auth Service
RUN pnpm --filter auth-service build


# ---------- PRODUCTION STAGE ----------
# Fresh smaller runtime image
FROM node:22-alpine AS production

# Work inside /app
WORKDIR /app

# Production environment
ENV NODE_ENV=production

# Enable pnpm
RUN corepack enable

# Copy workspace files and lockfile
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy package.json files needed by Auth Service
COPY apps/auth-service/package.json apps/auth-service/package.json
COPY packages/shared-rabbitmq/package.json packages/shared-rabbitmq/package.json
COPY packages/shared-redis/package.json packages/shared-redis/package.json

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy compiled Auth Service
COPY --from=build /app/apps/auth-service/dist ./apps/auth-service/dist

# Copy Prisma schema
COPY --from=build /app/apps/auth-service/prisma ./apps/auth-service/prisma

# Prisma Client is generated under src/, but compiled Auth code expects it under dist/
COPY --from=build /app/apps/auth-service/src/generated/prisma ./apps/auth-service/dist/generated/prisma

# Copy compiled shared packages
COPY --from=build /app/packages/shared-rabbitmq/dist ./packages/shared-rabbitmq/dist
COPY --from=build /app/packages/shared-redis/dist ./packages/shared-redis/dist

# Run from Auth Service directory
WORKDIR /app/apps/auth-service

# Auth Service port
EXPOSE 5000

# Start Auth Service
CMD ["node", "dist/server.js"]