# ---------- BUILD STAGE ----------
# Node.js 22 on Alpine Linux
FROM node:22-alpine AS build

# Work inside /app
WORKDIR /app

# Enable pnpm
RUN corepack enable

# Copy workspace configuration and lockfile
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./

# Copy package.json files needed by Notification Service
COPY apps/notification-service/package.json apps/notification-service/package.json
COPY packages/shared-rabbitmq/package.json packages/shared-rabbitmq/package.json
COPY packages/shared-redis/package.json packages/shared-redis/package.json

# Install dependencies including dev dependencies
RUN pnpm install --frozen-lockfile --prod=false

# Copy Notification Service source
COPY apps/notification-service apps/notification-service

# Copy shared package sources
COPY packages/shared-rabbitmq packages/shared-rabbitmq
COPY packages/shared-redis packages/shared-redis

# Compile shared packages
RUN pnpm exec tsc -p packages/shared-rabbitmq/tsconfig.json
RUN pnpm exec tsc -p packages/shared-redis/tsconfig.json

# Compile Notification Service
RUN pnpm --filter notification-service build


# ---------- PRODUCTION STAGE ----------
# Fresh lightweight runtime image
FROM node:22-alpine AS production

# Work inside /app
WORKDIR /app

# Production environment
ENV NODE_ENV=production

# Enable pnpm
RUN corepack enable

# Copy workspace files and lockfile
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy package.json files needed at runtime
COPY apps/notification-service/package.json apps/notification-service/package.json
COPY packages/shared-rabbitmq/package.json packages/shared-rabbitmq/package.json
COPY packages/shared-redis/package.json packages/shared-redis/package.json

# Install production dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy compiled Notification Service
COPY --from=build /app/apps/notification-service/dist ./apps/notification-service/dist

# Copy compiled shared packages
COPY --from=build /app/packages/shared-rabbitmq/dist ./packages/shared-rabbitmq/dist
COPY --from=build /app/packages/shared-redis/dist ./packages/shared-redis/dist

# Run from Notification Service directory
WORKDIR /app/apps/notification-service

# Notification Service port
EXPOSE 5002

# Start Notification Service
CMD ["node", "dist/server.js"]