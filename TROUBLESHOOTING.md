# Guide de Dépannage - Démolition Expert

## Erreurs 502/504 - Solutions Rapides

### 🔴 Erreur : "endpoint already exists"

**Symptôme** : Le déploiement échoue avec `cannot create entry in table endpoint_table`

**Solution rapide** :
```bash
# Sur le serveur Dokploy
./cleanup-docker.sh
# Puis redéployer
```

Ou manuellement :
```bash
docker service rm demoexpert-casseauto-bckdiq_app
docker service rm demoexpert-casseauto-bckdiq_api
docker container prune -f
```

### 🔴 Erreur : "502 Bad Gateway" après déploiement

**Causes possibles** :
1. Build frontend échoué (pas de `dist/index.html`)
2. Backend ne démarre pas
3. Problème de réseau Docker

**Diagnostic** :
```bash
# Vérifier les logs
docker logs demoexpert-casseauto-bckdiq-app-1
docker logs demoexpert-casseauto-bckdiq-backend-1

# Vérifier que les conteneurs tournent
docker ps | grep demoexpert

# Tester localement
curl http://localhost:80/health.txt
curl http://localhost:3000/healthz
```

**Solutions** :

1. **Forcer un rebuild sans cache** :
   - Dans Dokploy : cliquer sur "Redeploy" avec l'option "No cache"
   - Ou localement : `docker compose build --no-cache`

2. **Nettoyer et redémarrer** :
   ```bash
   docker compose down --remove-orphans
   docker system prune -f
   docker compose up -d
   ```

3. **Vérifier les variables d'environnement** :
   - `SESSION_SECRET` doit être défini
   - `DATABASE_URL` doit être accessible

### 🟡 Erreur : "Failed to fetch" sur le frontend

**Cause** : Le frontend ne peut pas joindre le backend

**Vérifications** :
```bash
# Vérifier que VITE_API_BASE_URL est correct
grep VITE_API_BASE_URL docker-compose.yml
# Doit être : https://api.demoexpert.fr/api

# Vérifier que le backend répond
curl https://api.demoexpert.fr/api/healthz
```

### 🟠 Erreur : Build très lent ou timeout

**Solution** : Utiliser le cache npm
```dockerfile
RUN --mount=type=cache,target=/root/.npm \
    npm ci --prefer-offline
```

## Bonnes Pratiques de Déploiement

### Avant chaque déploiement

1. ✅ Vérifier que `npm run build` fonctionne en local
2. ✅ Vérifier qu'il n'y a pas d'erreurs TypeScript
3. ✅ Vérifier que les tests passent (si existants)

### Pendant le déploiement

1. ✅ Surveiller les logs dans Dokploy
2. ✅ Attendre que les health checks passent
3. ✅ Tester les fonctionnalités critiques

### Après le déploiement

1. ✅ Vérifier que https://app.demoexpert.fr charge
2. ✅ Tester la connexion admin
3. ✅ Vérifier que l'API répond

## Commandes Utiles

```bash
# Logs en temps réel
docker logs -f demoexpert-casseauto-bckdiq-app-1
docker logs -f demoexpert-casseauto-bckdiq-backend-1

# Redémarrer un service
docker compose restart app
docker compose restart api

# Entrer dans un conteneur
docker exec -it demoexpert-casseauto-bckdiq-backend-1 sh

# Vérifier les ressources
docker stats
```

## Contact et Support

Si les problèmes persistent :
1. Vérifier les logs complets dans Dokploy
2. Vérifier l'état des services : `docker service ls`
3. Vérifier les réseaux : `docker network ls`
