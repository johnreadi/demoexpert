# Script de nettoyage Docker pour Demoexpert (PowerShell)
# Supprime les conteneurs arrêtés, les réseaux inutilisés et les images orphelines (dangling)

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

# 4. Supprimer les volumes inutilisés (Attention : supprime TOUS les volumes non attachés)
# C'est sans danger pour Demoexpert car la base de données est externe
Write-Host "Suppression des volumes orphelins..." -ForegroundColor Yellow
docker volume prune -f

Write-Host "--- NETTOYAGE TERMINÉ ---" -ForegroundColor Cyan
