#!/bin/sh
# Script de nettoyage Docker pour Demoexpert
# Supprime les conteneurs arrêtés et les images orphelines
# SÉCURITÉ : La suppression des volumes est désactivée par défaut pour éviter la perte de données de base de données.

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

# 4. Supprimer les volumes inutilisés
# ATTENTION : Cette commande est commentée par sécurité.
# Si votre base de données est sur ce serveur et est arrêtée, cette commande SUPPRIMERAIT ses données.
# Décommentez la ligne suivante UNIQUEMENT si vous êtes sûr de ce que vous faites.
# echo "Suppression des volumes orphelins..."
# docker volume prune -f

echo "--- NETTOYAGE TERMINÉ ---"
