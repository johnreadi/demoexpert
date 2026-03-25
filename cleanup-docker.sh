#!/bin/bash
# ============================================
# Script de nettoyage Docker pour résoudre les erreurs 502/504
# ============================================

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🧹 Nettoyage Docker pour Démolition Expert${NC}"
echo ""

# 1. Arrêter tous les conteneurs de l'application
echo -e "${YELLOW}1. Arrêt des conteneurs...${NC}"
docker compose down --remove-orphans 2>/dev/null || true

# 2. Supprimer les conteneurs spécifiques s'ils existent
echo -e "${YELLOW}2. Suppression des conteneurs résiduels...${NC}"
docker rm -f demoexpert-casseauto-bckdiq-app-1 2>/dev/null || true
docker rm -f demoexpert-casseauto-bckdiq-backend-1 2>/dev/null || true
docker rm -f demoexpert-casseauto-bckdiq-backend-new 2>/dev/null || true

# 3. Supprimer les services Swarm s'ils existent
echo -e "${YELLOW}3. Suppression des services Swarm...${NC}"
docker service rm demoexpert-casseauto-bckdiq_app 2>/dev/null || true
docker service rm demoexpert-casseauto-bckdiq_backend 2>/dev/null || true
docker service rm demoexpert-casseauto-bckdiq_api 2>/dev/null || true

# 4. Nettoyer les réseaux
echo -e "${YELLOW}4. Nettoyage des réseaux...${NC}"
docker network disconnect -f dokploy-overlay demoexpert-casseauto-bckdiq-app-1 2>/dev/null || true
docker network disconnect -f dokploy-overlay demoexpert-casseauto-bckdiq-backend-1 2>/dev/null || true
docker network disconnect -f dokploy-overlay demoexpert-backend-new 2>/dev/null || true
docker network disconnect -f dokploy-network demoexpert-casseauto-bckdiq-app-1 2>/dev/null || true
docker network disconnect -f dokploy-network demoexpert-casseauto-bckdiq-backend-1 2>/dev/null || true

# 5. Supprimer les images orphelines
echo -e "${YELLOW}5. Suppression des images orphelines...${NC}"
docker image prune -f

# 6. Supprimer le build cache
echo -e "${YELLOW}6. Nettoyage du cache de build...${NC}"
docker builder prune -f

echo ""
echo -e "${GREEN}✅ Nettoyage terminé !${NC}"
echo ""
echo "Vous pouvez maintenant redéployer avec:"
echo "  ./deploy.sh"
echo ""
echo "Ou via Dokploy en cliquant sur 'Deploy'"
