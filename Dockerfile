# Build stage
FROM node:24-alpine AS build
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Production stage
FROM node:24-alpine AS runtime
WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S adminuser -u 1001 -G nodejs

# Copy dependencies from build stage
COPY --from=build --chown=adminuser:nodejs /app/node_modules ./node_modules

# Copy application code
COPY --chown=adminuser:nodejs . .

# Create logs directory
RUN mkdir -p logs && chown adminuser:nodejs logs

# Switch to non-root user
USER adminuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3010/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Expose port
EXPOSE 3010

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]
