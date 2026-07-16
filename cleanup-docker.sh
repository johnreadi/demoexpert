#!/bin/bash
# ============================================
# Script de nettoyage AGRESSIF pour Docker Swarm
# Résout les erreurs "endpoint already exists"
# ============================================

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🧹 Nettoyage AGRESSIF Docker pour Démolition Expert${NC}"
echo ""

# 1. Arrêter tous les conteneurs de l'application
echo -e "${YELLOW}1. Arrêt des conteneurs...${NC}"
docker compose down --remove-orphans 2>/dev/null || true
docker compose -f docker-compose.yml down --remove-orphans 2>/dev/null || true

# 2. Forcer la suppression des conteneurs même s'ils sont en cours d'exécution
echo -e "${YELLOW}2. Suppression forcée des conteneurs...${NC}"
docker rm -f demoexpert-app 2>/dev/null || true
docker rm -f demoexpert-api 2>/dev/null || true
docker rm -f demoexpert-casseauto-bckdiq-app-1 2>/dev/null || true
docker rm -f demoexpert-casseauto-bckdiq-api-1 2>/dev/null || true
docker rm -f demoexpert-casseauto-bckdiq-backend-1 2>/dev/null || true
docker rm -f demoexpert-casseauto-bckdiq-backend-new 2>/dev/null || true

# 3. Supprimer les services Swarm s'ils existent
echo -e "${YELLOW}3. Suppression des services Swarm...${NC}"
docker service rm demoexpert-casseauto-bckdiq_app 2>/dev/null || true
docker service rm demoexpert-casseauto-bckdiq_backend 2>/dev/null || true
docker service rm demoexpert-casseauto-bckdiq_api 2>/dev/null || true
docker service rm demoexpert_app 2>/dev/null || true
docker service rm demoexpert_api 2>/dev/null || true
# Supprimer tout service orphelin lié à demoexpert ou expert-frontend
for svc in $(docker service ls --format '{{.Name}}' | grep -E '^demoexpert|^expert-frontend' || true); do
  echo -e "${YELLOW}   Suppression du service orphelin : $svc${NC}"
  docker service rm "$svc" 2>/dev/null || true
done

# 4. Nettoyer les réseaux - méthode agressive
echo -e "${YELLOW}4. Nettoyage des réseaux (méthode agressive)...${NC}"
# Déconnecter tous les conteneurs des réseaux
for container in $(docker ps -aq --filter "name=demoexpert" 2>/dev/null); do
    docker network disconnect -f dokploy-overlay "$container" 2>/dev/null || true
    docker network disconnect -f dokploy-network "$container" 2>/dev/null || true
done

# 5. Supprimer les images spécifiques
echo -e "${YELLOW}5. Suppression des images du projet...${NC}"
docker rmi -f demoexpert-app:latest 2>/dev/null || true
docker rmi -f demoexpert-api:latest 2>/dev/null || true
docker rmi -f demoexpert-casseauto-bckdiq-app:latest 2>/dev/null || true
docker rmi -f demoexpert-casseauto-bckdiq-api:latest 2>/dev/null || true

# 6. Nettoyage complet
echo -e "${YELLOW}6. Nettoyage du système Docker...${NC}"
docker container prune -f
docker image prune -af
docker builder prune -af

# 7. Redémarrer Docker si nécessaire (optionnel, décommenter si besoin)
# echo -e "${YELLOW}7. Redémarrage de Docker...${NC}"
# systemctl restart docker

echo ""
echo -e "${GREEN}✅ Nettoyage terminé !${NC}"
echo ""
echo "Vous pouvez maintenant redéployer avec:"
echo "  docker compose up -d"
echo ""
echo "Ou via Dokploy en cliquant sur 'Deploy'"
