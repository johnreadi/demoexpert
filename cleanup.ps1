# Script de nettoyage Docker pour Demoexpert (PowerShell)
# Supprime les conteneurs arrêtés, les réseaux inutilisés et les images orphelines (dangling)
# SÉCURITÉ : La suppression des volumes est désactivée par défaut pour éviter la perte de données de base de données.

Write-Host "--- DÉBUT DU NETTOYAGE DOCKER ---" -ForegroundColor Cyan

# 1. Supprimer les conteneurs arrêtés (zombies)
Write-Host "Suppression des conteneurs arrêtés..." -ForegroundColor Yellow
docker container prune -f

# 2. Supprimer les réseaux non utilisés
Write-Host "Suppression des réseaux inutilisés..." -ForegroundColor Yellow
docker network prune -f

# 3. Supprimer les images orphelines (dangling)
# Cela ne supprime PAS les images utilisées par les conteneurs en cours d'exécution
Write-Host "Suppression des images orphelines..." -ForegroundColor Yellow
docker image prune -f

# 4. Supprimer les volumes inutilisés
# ATTENTION : Cette commande est commentée par sécurité.
# Si votre base de données est sur ce serveur et est arrêtée, cette commande SUPPRIMERAIT ses données.
# Décommentez la ligne suivante UNIQUEMENT si vous êtes sûr de ce que vous faites.
# Write-Host "Suppression des volumes orphelins..." -ForegroundColor Red
# docker volume prune -f

Write-Host "--- NETTOYAGE TERMINÉ ---" -ForegroundColor Cyan
