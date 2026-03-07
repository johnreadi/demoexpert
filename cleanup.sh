#!/bin/sh
# Script de nettoyage Docker pour Demoexpert (Version Améliorée)
# Supprime les conteneurs bloqués, les réseaux fantômes et les images orphelines
# SÉCURITÉ : La suppression des volumes est désactivée par défaut.

echo "--- DÉBUT DU NETTOYAGE DOCKER ---"

# Noms des conteneurs spécifiques à Demoexpert (adapté à Dokploy)
CONTAINERS="demoexpert-expert-o859jz-backend-1 demoexpert-expert-o859jz-app-1"

echo "1. Arrêt forcé et suppression des conteneurs de l'application..."
for container in $CONTAINERS; do
    echo "Traitement de $container..."
    docker stop $container >/dev/null 2>&1
    docker rm -f $container >/dev/null 2>&1
done

echo "2. Déconnexion forcée du réseau dokploy-overlay (au cas où)..."
for container in $CONTAINERS; do
    docker network disconnect -f dokploy-overlay $container >/dev/null 2>&1
done

echo "3. Nettoyage général du système Docker..."
# Supprime les conteneurs arrêtés
echo "Suppression des conteneurs arrêtés..."
docker container prune -f

# Supprime les réseaux non utilisés
echo "Suppression des réseaux inutilisés..."
docker network prune -f

# Supprime les images orphelines (dangling)
echo "Suppression des images orphelines..."
docker image prune -f

echo "--- NETTOYAGE TERMINÉ ---"
echo "Vous pouvez maintenant relancer le déploiement sur Dokploy."
