#!/bin/bash
# ============================================================
# Script de vérification post-déploiement Demoexpert
# Détecte les conflits entre conteneurs Compose et services Swarm
# ============================================================

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

DOMAIN="app.demoexpert.fr"
API_DOMAIN="api.demoexpert.fr"
ERRORS=0

echo -e "${YELLOW}🔍 Vérification post-déploiement Demoexpert${NC}"
echo ""

# 1. Vérifier les services Swarm orphelins
echo -e "${YELLOW}1. Services Swarm susceptibles de créer des conflits${NC}"
ORPHANS=$(docker service ls --format '{{.Name}}' | grep -E 'demoexpert|expert-frontend' || true)
if [ -n "$ORPHANS" ]; then
  echo -e "${RED}   ❌ Services orphelins détectés :${NC}"
  echo "$ORPHANS" | sed 's/^/      - /'
  echo -e "${YELLOW}      → Supprimez-les avec : docker service rm <nom>${NC}"
  ERRORS=$((ERRORS + 1))
else
  echo -e "${GREEN}   ✅ Aucun service Swart orphelin détecté${NC}"
fi

# 2. Vérifier que les conteneurs Compose tournent
echo -e "${YELLOW}2. Conteneurs Compose de l'application${NC}"
APP_CONTAINER=$(docker ps --format '{{.Names}}' | grep -E '^(demoexpert|expert)-casseauto.*-app-1$' || true)
API_CONTAINER=$(docker ps --format '{{.Names}}' | grep -E '^(demoexpert|expert)-casseauto.*-api-1$' || true)
if [ -n "$APP_CONTAINER" ] && [ -n "$API_CONTAINER" ]; then
  echo -e "${GREEN}   ✅ App : $APP_CONTAINER${NC}"
  echo -e "${GREEN}   ✅ API : $API_CONTAINER${NC}"
else
  echo -e "${RED}   ❌ Conteneurs Compose manquants${NC}"
  ERRORS=$((ERRORS + 1))
fi

# 3. Vérifier le contenu de l'index.html servi
echo -e "${YELLOW}3. Contenu du frontend${NC}"
if [ -n "$APP_CONTAINER" ]; then
  SCRIPT_SRC=$(docker exec "$APP_CONTAINER" sh -c "cat /usr/share/nginx/html/index.html | grep -o 'src=\"[^\"]*\"' | grep '/assets/index' || true")
  if [ -n "$SCRIPT_SRC" ]; then
    echo -e "${GREEN}   ✅ Bundle Vite correct : $SCRIPT_SRC${NC}"
  else
    echo -e "${RED}   ❌ L'index.html ne contient pas le bundle /assets/index-*.js${NC}"
    ERRORS=$((ERRORS + 1))
  fi
else
  echo -e "${YELLOW}   ⚠️ Impossible de vérifier (conteneur non trouvé)${NC}"
fi

# 4. Vérifier les réponses HTTP
echo -e "${YELLOW}4. Tests HTTP${NC}"
HTTP_APP=$(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN/" || echo "000")
HTTP_API=$(curl -s -o /dev/null -w "%{http_code}" "https://$API_DOMAIN/api/healthz" || echo "000")

if [ "$HTTP_APP" = "200" ]; then
  echo -e "${GREEN}   ✅ https://$DOMAIN/ → $HTTP_APP${NC}"
else
  echo -e "${RED}   ❌ https://$DOMAIN/ → $HTTP_APP${NC}"
  ERRORS=$((ERRORS + 1))
fi

if [ "$HTTP_API" = "200" ]; then
  echo -e "${GREEN}   ✅ https://$API_DOMAIN/api/healthz → $HTTP_API${NC}"
else
  echo -e "${RED}   ❌ https://$API_DOMAIN/api/healthz → $HTTP_API${NC}"
  ERRORS=$((ERRORS + 1))
fi

echo ""
# 5. Vérifier que Traefik est sur le réseau dokploy-overlay
if [ -n "$APP_CONTAINER" ]; then
  echo -e "${YELLOW}5. Réseau Traefik${NC}"
  TRAEFIK_IN_NETWORK=$(docker network inspect dokploy-overlay --format='{{json .Containers}}' | grep -c 'dokploy-traefik' || true)
  if [ "$TRAEFIK_IN_NETWORK" -gt 0 ]; then
    echo -e "${GREEN}   ✅ Traefik est connecté à dokploy-overlay${NC}"
  else
    echo -e "${RED}   ❌ Traefik n'est pas connecté à dokploy-overlay${NC}"
    echo -e "${YELLOW}      → Exécutez : docker network connect dokploy-overlay dokploy-traefik && docker restart dokploy-traefik${NC}"
    ERRORS=$((ERRORS + 1))
  fi
fi

if [ "$ERRORS" -eq 0 ]; then
  echo -e "${GREEN}✅ Toutes les vérifications sont passées${NC}"
  exit 0
else
  echo -e "${RED}❌ $ERRORS problème(s) détecté(s)${NC}"
  exit 1
fi
