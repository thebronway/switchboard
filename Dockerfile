# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copy dependency files first for caching
COPY package*.json ./
RUN npm ci

# Copy the rest of the application code
COPY . .

# (Future step: build TypeScript)
# RUN npm run build

# Stage 2: Production Run
FROM node:20-alpine

WORKDIR /usr/src/app

# Set environment to production
ENV NODE_ENV=production

# Copy only the necessary files from the builder
# COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json ./

# Enforce non-root user for security (defense-in-depth)
USER node

EXPOSE 3000

# We will update this command once the TypeScript compilation is fully set up
CMD ["npm", "start"]