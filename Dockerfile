# Base stage for both development and production
FROM node:20-alpine AS base
WORKDIR /usr/src/app
RUN npm install -g pnpm

# Development stage
FROM base AS development
COPY package.json pnpm-lock.yaml ./
RUN pnpm install
COPY . .
CMD ["pnpm", "start:dev"]

# Build stage
FROM base AS build
COPY package.json pnpm-lock.yaml ./
RUN pnpm install
COPY . .
RUN pnpm build

# Production stage
FROM base AS production
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod
COPY --from=build /usr/src/app/dist ./dist
CMD ["pnpm", "start:prod"] 