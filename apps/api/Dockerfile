# apps/api/Dockerfile

FROM node:20-alpine AS builder

# Install openssl and libc6-compat for Prisma
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production image
FROM node:20-alpine

# Install openssl and libc6-compat for Prisma
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
# Ensure uploads directory exists
RUN mkdir -p uploads

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
