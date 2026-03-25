#!/bin/bash
# ============================================
# Script de déploiement sécurisé pour Dokploy
# ============================================

set -euo pipefail

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Démarrage du déploiement Démolition Expert${NC}"

# Vérifier les variables d'environnement requises
if [ -z "${SESSION_SECRET:-}" ]; then
    echo -e "${RED}❌ ERREUR: SESSION_SECRET non défini${NC}"
    echo "Générez-le avec: node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\""
    exit 1
fi

# Vérifier que les fichiers essentiels existent
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}❌ ERREUR: docker-compose.yml manquant${NC}"
    exit 1
fi

if [ ! -f "Dockerfile.web" ]; then
    echo -e "${RED}❌ ERREUR: Dockerfile.web manquant${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 Étape 1: Build des images sans cache${NC}"
docker compose build --no-cache

echo -e "${YELLOW}🧪 Étape 2: Vérification du build${NC}"
# Vérifier que l'image frontend contient bien dist/index.html
if ! docker run --rm demoexpert-casseauto-bckdiq-app:latest test -f /usr/share/nginx/html/index.html; then
    echo -e "${RED}❌ ERREUR: Le build frontend ne contient pas index.html${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Build frontend vérifié${NC}"

# Vérifier que le backend démarre
if ! docker run --rm demoexpert-casseauto-bckdiq-backend:latest node -e "console.log('OK')" 2>/dev/null; then
    echo -e "${RED}❌ ERREUR: Le backend ne démarre pas${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Build backend vérifié${NC}"

echo -e "${YELLOW}🛑 Étape 3: Arrêt des conteneurs existants${NC}"
docker compose down --remove-orphans

# Attendre que les réseaux soient libérés
echo -e "${YELLOW}⏳ Attente de libération des réseaux (5s)...${NC}"
sleep 5

echo -e "${YELLOW}🚀 Étape 4: Démarrage des services${NC}"
docker compose up -d

echo -e "${YELLOW}⏳ Attente du démarrage (30s)...${NC}"
sleep 30

echo -e "${YELLOW}🧪 Étape 5: Vérification des services${NC}"

# Vérifier le frontend
if curl -sf http://localhost:80/health.txt > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend (app) est en ligne${NC}"
else
    echo -e "${RED}❌ Frontend (app) ne répond pas${NC}"
    docker logs demoexpert-casseauto-bckdiq-app-1 --tail 20
    exit 1
fi

# Vérifier le backend
if curl -sf http://localhost:3000/healthz > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend (api) est en ligne${NC}"
else
    echo -e "${RED}❌ Backend (api) ne répond pas${NC}"
    docker logs demoexpert-casseauto-bckdiq-backend-1 --tail 20
    exit 1
fi

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Déploiement réussi !${NC}"
echo -e "${GREEN}========================================${NC}"
echo "Frontend: https://app.demoexpert.fr"
echo "Backend:  https://api.demoexpert.fr"
echo ""
echo "Commandes utiles:"
echo "  - Logs frontend: docker logs -f demoexpert-casseauto-bckdiq-app-1"
echo "  - Logs backend:  docker logs -f demoexpert-casseauto-bckdiq-backend-1"
echo "  - Redémarrer:    docker compose restart"
