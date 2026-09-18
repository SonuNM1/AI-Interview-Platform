# -------------- BUILD STAGE ------------
    
# Node.js 22 on Alpine Linux 

FROM node:22-alpine AS build 

# Work inside /app 

WORKDIR /app 

# Enable pnpm 

RUN corepack enable 

# Copy workspace configuration and lockfile 

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./

# Copy AI service package.json 

COPY apps/ai-service/package.json apps/ai-service/package.json 

# Install dependencies including dev dependencies 

RUN pnpm install --frozen-lockfile --prod=false 

# Copy AI Service source 

COPY apps/ai-service apps/ai-service 

# Compile TypeScript 

RUN pnpm --filter ai-service build 


# ----------- PRODUCTION STAGE -----------


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

# Copy AI Service package.json

COPY apps/ai-service/package.json apps/ai-service/package.json

# Install production dependencies only

RUN pnpm install --frozen-lockfile --prod

# Copy compiled AI Service

COPY --from=build /app/apps/ai-service/dist ./apps/ai-service/dist

# Run from AI Service directory

WORKDIR /app/apps/ai-service

# AI Service port

EXPOSE 5006

# Start AI Service

CMD ["node", "dist/server.js"]