# ---------- BUILD STAGE ----------
# Node.js 22 on Alpine Linux
FROM node:22-alpine AS build

# Work inside /app
WORKDIR /app

# Enable pnpm
RUN corepack enable

# Copy workspace configuration and lockfile
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./

# Copy API Gateway package.json
COPY apps/api-gateway/package.json apps/api-gateway/package.json

# Install dependencies including dev dependencies
RUN pnpm install --frozen-lockfile --prod=false

# Copy API Gateway source
COPY apps/api-gateway apps/api-gateway

# Compile TypeScript
RUN pnpm --filter api-gateway build


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

# Copy API Gateway package.json
COPY apps/api-gateway/package.json apps/api-gateway/package.json

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy compiled API Gateway
COPY --from=build /app/apps/api-gateway/dist ./apps/api-gateway/dist

# Run from API Gateway directory
WORKDIR /app/apps/api-gateway

# API Gateway port
EXPOSE 4000

# Start API Gateway
CMD ["node", "dist/server.js"]