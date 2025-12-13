# Test Stage
FROM node:24-slim AS test

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npx playwright install --with-deps chromium

ENV CI=true
RUN npm run test
RUN npm run test:e2e

# Build stage
FROM node:24-slim AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Accept build arguments for environment variables
ARG SENTRY_DSN
ARG VITE_API_URL

# Set environment variables for build
ENV SENTRY_DSN=${SENTRY_DSN}
ENV VITE_API_URL=${VITE_API_URL}

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Add labels for metadata
LABEL maintainer="your-email@example.com"
LABEL description="Production-ready React booking calendar application"

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
