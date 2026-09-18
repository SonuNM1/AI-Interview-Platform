
FROM node:22-alpine AS build

# Work inside /app
WORKDIR /app

# Enable pnpm
RUN corepack enable

# Copy workspace configuration and lockfile
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./

# Copy package.json files needed for this service
COPY apps/user-service/package.json apps/user-service/package.json
COPY packages/shared-rabbitmq/package.json packages/shared-rabbitmq/package.json

# Install dependencies including dev dependencies
RUN pnpm install --frozen-lockfile --prod=false

# Copy User Service source
COPY apps/user-service apps/user-service

# Copy shared RabbitMQ source
COPY packages/shared-rabbitmq packages/shared-rabbitmq

# Generate Prisma Client
RUN pnpm --filter user-service exec prisma generate

# Compile shared RabbitMQ TypeScript to JavaScript
RUN pnpm exec tsc -p packages/shared-rabbitmq/tsconfig.json

# Compile User Service
RUN pnpm exec tsc -p apps/user-service/tsconfig.json


# ---------- PRODUCTION STAGE ----------
# Fresh runtime image
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
COPY apps/user-service/package.json apps/user-service/package.json
COPY packages/shared-rabbitmq/package.json packages/shared-rabbitmq/package.json

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy compiled User Service
COPY --from=build /app/apps/user-service/dist ./apps/user-service/dist

# Copy Prisma schema
COPY --from=build /app/apps/user-service/prisma ./apps/user-service/prisma

# Copy generated Prisma Client into dist
COPY --from=build /app/apps/user-service/src/generated/prisma ./apps/user-service/dist/generated/prisma

# Copy compiled shared RabbitMQ package
COPY --from=build /app/packages/shared-rabbitmq/dist ./packages/shared-rabbitmq/dist

# Run from User Service directory
WORKDIR /app/apps/user-service

# User Service port
EXPOSE 5001

# Start User Service
CMD ["node", "dist/server.js"]