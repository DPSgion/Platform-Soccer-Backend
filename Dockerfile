
# BUILDER (Hard work)
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# PRODUCTION (Soft work)
FROM node:20-alpine
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./

COPY . .

EXPOSE 3000
CMD ["npm", "run", "dev"]