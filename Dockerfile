<<<<<<< HEAD

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
=======
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install
>>>>>>> 1492c02556c6d8eebfa0c5af7462a34d78e1a425

COPY . .

EXPOSE 3000
<<<<<<< HEAD
CMD ["npm", "start"]
=======

CMD ["npm", "run", "dev"]
>>>>>>> 1492c02556c6d8eebfa0c5af7462a34d78e1a425
