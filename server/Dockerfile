# --- Build stage ---
FROM node:20-bookworm-slim AS build
WORKDIR /app
# Ensure OpenSSL and CA certs for Prisma engines during build
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl ca-certificates net-tools \
  && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
RUN npm install --no-fund --no-audit
COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src
RUN npx prisma generate && npm run build

# --- Runner stage ---
FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl ca-certificates net-tools \
  && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
RUN npm install --omit=dev --no-fund --no-audit
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
EXPOSE 8080
CMD ["node", "dist/index.js"]
