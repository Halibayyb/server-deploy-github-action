# Build stage
FROM oven/bun:latest AS builder

WORKDIR /app

COPY package.json bun.lock ./

RUN bun ci

COPY src ./src
COPY tsconfig.json ./

# Build TypeScript
RUN bun run build

# Runtime stage - use slim alpine-based image
FROM oven/bun:alpine

WORKDIR /app

COPY package.json bun.lock ./

RUN bun ci --production && \
    rm -rf /root/.bun/install/cache

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["bun", "run", "dist/index.js"]