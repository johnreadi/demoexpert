#!/bin/sh
# Script de nettoyage Docker pour Demoexpert
# Supprime les conteneurs arrêtés, les réseaux inutilisés et les images orphelines (dangling)

echo "--- DÉBUT DU NETTOYAGE DOCKER ---"

# 1. Supprimer les conteneurs arrêtés (zombies)
echo "Suppression des conteneurs arrêtés..."
docker container prune -f

# 2. Supprimer les réseaux non utilisés
echo "Suppression des réseaux inutilisés..."
docker network prune -f

# 3. Supprimer les images orphelines (dangling)
# Cela ne supprime PAS les images utilisées par les conteneurs en cours d'exécution
echo "Suppression des images orphelines..."
docker image prune -f

# 4. Supprimer les volumes inutilisés (Attention : supprime TOUS les volumes non attachés)
# C'est sans danger pour Demoexpert car la base de données est externe
echo "Suppression des volumes orphelins..."
docker volume prune -f

echo "--- NETTOYAGE TERMINÉ ---"
