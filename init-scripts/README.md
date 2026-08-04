# Base de données PostgreSQL (service `db`)

Depuis la migration d'août 2026, la base de données est gérée **dans le docker-compose.yml**
(service `db`, volume nommé `demoexpert-expertdb-data`). Elle n'est plus un service Swarm
externe géré séparément par Dokploy.

## Première mise en service (migration one-shot, déjà effectuée)

1. Le service `db` démarre avec un volume vide → PostgreSQL initialise la base `demoexpert-expertdb-djopvt`.
2. L'API exécute `prisma migrate deploy` (création des tables).
3. Les données de l'ancienne base (dump `--data-only`) sont restaurées sur le serveur :

```bash
DB_CONTAINER=$(docker ps --format "{{.Names}}" --filter "name=demoexpert-casseauto-bckdiq-db" | head -1)
# Retirer l'historique _prisma_migrations du dump (déjà recréé par l'API)
sed '/^COPY public._prisma_migrations/,/^\\\.$/d' /root/demoexpert_data_only.sql > /root/demoexpert_restore_clean.sql
docker cp /root/demoexpert_restore_clean.sql "$DB_CONTAINER":/tmp/restore.sql
docker exec "$DB_CONTAINER" psql -U dokploy -d demoexpert-expertdb-djopvt -f /tmp/restore.sql
```

## Notes

- Le schéma est toujours créé par Prisma (`prisma migrate deploy` dans `server/entrypoint.sh`).
- Les identifiants sont des `cuid`/`uuid` (pas de séquences à resynchroniser après restauration).
- `SEED_DB` est désactivé dans le compose : les données proviennent de la base réelle, pas du seed.
