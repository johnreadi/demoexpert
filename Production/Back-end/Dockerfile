# Dockerfile pour le backend Node.js
FROM node:18-alpine AS builder

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production

# Copier le code source
COPY . .

# Build l'application TypeScript
RUN npm run build

# Étape de production
FROM node:18-alpine AS production

# Installer les outils de sécurité et de monitoring
RUN apk add --no-cache dumb-init curl

# Créer un utilisateur non-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers depuis l'étape de build
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./

# Créer les répertoires nécessaires
RUN mkdir -p uploads logs && chown -R nodejs:nodejs uploads logs

# Changer d'utilisateur
USER nodejs

# Exposer le port
EXPOSE 5000

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Démarrer l'application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
