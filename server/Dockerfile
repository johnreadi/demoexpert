# --- Build stage ---
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
RUN npm ci || yarn install --frozen-lockfile || pnpm i --frozen-lockfile
COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src
RUN npm run build || yarn build || pnpm build

# --- Runner stage ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
RUN npm ci --omit=dev || yarn install --production --frozen-lockfile || pnpm i --prod --frozen-lockfile
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
EXPOSE 8080
CMD ["node", "dist/index.js"]
