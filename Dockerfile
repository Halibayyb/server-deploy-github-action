# Build stage
FROM oven/bun:latest AS builder

WORKDIR /app

COPY package.json bun.lock ./

RUN bun ci

COPY src ./src
COPY tsconfig.json ./

# Build TypeScript
RUN bun run build

FROM oven/bun:latest

WORKDIR /app

COPY package.json bun.lock ./

RUN bun ci --production

COPY --from=builder /app/dist ./dist

EXPOSE 3000

# Start the application
CMD ["bun", "run", "dist/index.js"]
