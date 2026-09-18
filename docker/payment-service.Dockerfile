# ---------- BUILD STAGE ----------
# Node.js 22 on Alpine Linux
FROM node:22-alpine AS build

# Work inside /app
WORKDIR /app

# Enable pnpm
RUN corepack enable

# Copy workspace configuration and lockfile
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./

# Copy package.json files needed by Payment Service
COPY apps/payment-service/package.json apps/payment-service/package.json
COPY packages/shared-rabbitmq/package.json packages/shared-rabbitmq/package.json

# Install dependencies including dev dependencies
RUN pnpm install --frozen-lockfile --prod=false

# Copy Payment Service source
COPY apps/payment-service apps/payment-service

# Copy shared RabbitMQ source
COPY packages/shared-rabbitmq packages/shared-rabbitmq

# Compile shared RabbitMQ package
RUN pnpm exec tsc -p packages/shared-rabbitmq/tsconfig.json

# Compile Payment Service
RUN pnpm --filter payment-service build


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
COPY apps/payment-service/package.json apps/payment-service/package.json
COPY packages/shared-rabbitmq/package.json packages/shared-rabbitmq/package.json

# Install production dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy compiled Payment Service
COPY --from=build /app/apps/payment-service/dist ./apps/payment-service/dist

# Copy compiled shared RabbitMQ package
COPY --from=build /app/packages/shared-rabbitmq/dist ./packages/shared-rabbitmq/dist

# Run from Payment Service directory
WORKDIR /app/apps/payment-service

# Payment Service port
EXPOSE 5009

# Start Payment Service
CMD ["node", "dist/server.js"]