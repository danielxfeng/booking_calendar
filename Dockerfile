# Build stage
FROM node:22-alpine AS builder

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
ARG VITE_IS_AUTH

# Set environment variables for build
ENV SENTRY_DSN=${SENTRY_DSN}
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_IS_AUTH=${VITE_IS_AUTH}

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
