# --- Build stage ---
FROM node:20-bookworm-slim AS build
WORKDIR /app
# Ensure OpenSSL and CA certs for Prisma engines during build
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl ca-certificates netcat-openbsd \
  && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
RUN npm install --no-fund --no-audit
COPY tsconfig.json ./
COPY start.js fallback.js start.sh ./
COPY prisma ./prisma
COPY src ./src
RUN npx prisma generate && npm run build

# --- Runner stage ---
FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl ca-certificates netcat-openbsd \
  && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
RUN npm install --omit=dev --no-fund --no-audit
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma
COPY start.js fallback.js start.sh ./
COPY healthcheck.js ./healthcheck.js
EXPOSE 8080
CMD ["sh", "-c", "if [ \"${RUN_SEED:-false}\" = \"true\" ]; then node dist/seed.js; fi; node dist/index.js"]
