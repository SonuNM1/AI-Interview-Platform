# ---------- BUILD STAGE ----------
# Node.js 22 on Alpine Linux
FROM node:22-alpine AS build

# Work inside /app
WORKDIR /app

# Enable pnpm
RUN corepack enable

# Copy workspace configuration and lockfile
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./

# Copy Mock Interview Service package.json
COPY apps/mock-interview-service/package.json apps/mock-interview-service/package.json

# Install dependencies including dev dependencies
RUN pnpm install --frozen-lockfile --prod=false

# Copy Mock Interview Service source
COPY apps/mock-interview-service apps/mock-interview-service

# Compile TypeScript
RUN pnpm --filter mock-interview-service build


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

# Copy Mock Interview Service package.json
COPY apps/mock-interview-service/package.json apps/mock-interview-service/package.json

# Install production dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy compiled Mock Interview Service
COPY --from=build /app/apps/mock-interview-service/dist ./apps/mock-interview-service/dist

# Run from Mock Interview Service directory
WORKDIR /app/apps/mock-interview-service

# Mock Interview Service port
EXPOSE 5008

# Start Mock Interview Service
CMD ["node", "dist/server.js"]