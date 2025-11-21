# Stage 1: build du frontend React (Vite)
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les manifests pour installer les dépendances
COPY package.json package-lock.json* ./

RUN npm install

# Copier tout le code de l'application
COPY . .

# Construire le frontend (sortie dans /app/dist)
RUN npm run build

# Stage 2: image finale pour le backend + fichiers statiques
FROM node:20-alpine

WORKDIR /app

# Copier le backend
COPY backend ./backend

# Copier le build frontend dans le dossier public du backend
COPY --from=builder /app/dist ./backend/public

# Installer les dépendances backend
WORKDIR /app/backend
RUN npm install --production

# Exposer le port (fourni par Dokploy via env PORT)
ENV PORT=3001
EXPOSE 3001

# Lancer le serveur Express
CMD ["node", "server.js"]
