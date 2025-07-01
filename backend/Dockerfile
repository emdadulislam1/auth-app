# Use the official Bun image
FROM oven/bun:1-alpine AS base

# Set working directory
WORKDIR /app

# Install system dependencies for SQLite and other native modules
RUN apk add --no-cache \
    sqlite \
    sqlite-dev \
    python3 \
    make \
    g++ \
    curl

# Copy package files
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install --frozen-lockfile --production

# Copy source code and tests
COPY . .

# Run tests to ensure code quality
RUN echo "🧪 Running tests to validate build..." && \
    bun test && \
    echo "✅ All tests passed!"

# Create a non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S backend -u 1001

# Create directory for SQLite database
RUN mkdir -p /app/data && chown -R backend:nodejs /app/data

# Switch to non-root user
USER backend

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1

# Start the application
CMD ["bun", "run", "src/server.ts"] 