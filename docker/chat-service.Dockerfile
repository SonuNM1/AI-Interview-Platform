# ---------- BUILD STAGE ----------
# Node.js 22 on Alpine Linux
FROM node:22-alpine AS build

# Work inside /app
WORKDIR /app

# Enable pnpm
RUN corepack enable

# Copy workspace configuration and lockfile
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./

# Copy package.json files needed by Chat Service
COPY apps/chat-service/package.json apps/chat-service/package.json
COPY packages/shared-rabbitmq/package.json packages/shared-rabbitmq/package.json

# Install dependencies including dev dependencies
RUN pnpm install --frozen-lockfile --prod=false

# Copy Chat Service source
COPY apps/chat-service apps/chat-service

# Copy shared RabbitMQ source
COPY packages/shared-rabbitmq packages/shared-rabbitmq

# Compile shared RabbitMQ package
RUN pnpm exec tsc -p packages/shared-rabbitmq/tsconfig.json

# Compile Chat Service
RUN pnpm --filter chat-service build


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
COPY apps/chat-service/package.json apps/chat-service/package.json
COPY packages/shared-rabbitmq/package.json packages/shared-rabbitmq/package.json

# Install workspace dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy compiled Chat Service
COPY --from=build /app/apps/chat-service/dist ./apps/chat-service/dist

# Copy compiled shared RabbitMQ package
COPY --from=build /app/packages/shared-rabbitmq/dist ./packages/shared-rabbitmq/dist

# Run from Chat Service directory
WORKDIR /app/apps/chat-service

# Chat Service port
EXPOSE 5005

# Start Chat Service
CMD ["node", "dist/server.js"]