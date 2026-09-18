# ---------- BUILD STAGE ----------
# Node.js 22 on Alpine Linux
FROM node:22-alpine AS build

# Work inside /app
WORKDIR /app

# Enable pnpm
RUN corepack enable

# Copy workspace configuration and lockfile
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./

# Copy RAG Service package.json
COPY apps/rag-service/package.json apps/rag-service/package.json

# Install dependencies including dev dependencies
RUN pnpm install --frozen-lockfile --prod=false

# Copy RAG Service source
COPY apps/rag-service apps/rag-service

# Compile TypeScript
RUN pnpm --filter rag-service build


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

# Copy RAG Service package.json
COPY apps/rag-service/package.json apps/rag-service/package.json

# Install production dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy compiled RAG Service
COPY --from=build /app/apps/rag-service/dist ./apps/rag-service/dist

# Run from RAG Service directory
WORKDIR /app/apps/rag-service

# RAG Service port
EXPOSE 5007

# Start RAG Service
CMD ["node", "dist/server.js"]