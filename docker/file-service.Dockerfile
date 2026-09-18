# ---------- BUILD STAGE ----------
# Node.js 22 on Alpine Linux
FROM node:22-alpine AS build

# Work inside /app
WORKDIR /app

# Enable pnpm
RUN corepack enable

# Copy workspace configuration and lockfile
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./

# Copy File Service package.json
COPY apps/file-service/package.json apps/file-service/package.json

# Install dependencies including dev dependencies
RUN pnpm install --frozen-lockfile --prod=false

# Copy File Service source
COPY apps/file-service apps/file-service

# Compile TypeScript
RUN pnpm --filter file-service build


# ---------- PRODUCTION STAGE ----------
# Fresh lightweight runtime image
FROM node:22-alpine AS production

# Work inside /app
WORKDIR /app

# Production environment
ENV NODE_ENV=production

# Enable pnpm in the runtime image
RUN corepack enable

# Copy workspace files and lockfile
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy File Service package.json
COPY apps/file-service/package.json apps/file-service/package.json

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy compiled File Service
COPY --from=build /app/apps/file-service/dist ./apps/file-service/dist

# Run from File Service directory
WORKDIR /app/apps/file-service

# File Service port
EXPOSE 5004

# Start File Service
CMD ["node", "dist/server.js"]