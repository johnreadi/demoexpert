#!/bin/sh
set -e

echo "--- 🚀 STARTUP SCRIPT (entrypoint.sh) ---"

STRICT_DB="${STRICT_DB:-false}"
MIGRATE_DB="${MIGRATE_DB:-true}"
MIGRATE_RETRIES="${MIGRATE_RETRIES:-20}"
MIGRATE_SLEEP_SECONDS="${MIGRATE_SLEEP_SECONDS:-3}"

mask_db_url() {
  echo "$1" | sed 's/:[^:@]*@/:****@/'
}

if [ -z "$DATABASE_URL" ]; then
  echo "DATABASE_URL is NOT set"
  if [ "$STRICT_DB" = "true" ]; then
    echo "STRICT_DB=true -> refusing to start"
    exit 1
  fi
else
  echo "DATABASE_URL is set (masked): $(mask_db_url "$DATABASE_URL")"
  case "$DATABASE_URL" in
    */postgres|*/postgres?*)
      echo "DATABASE_URL points to database 'postgres' (disallowed): $(mask_db_url "$DATABASE_URL")"
      if [ "$STRICT_DB" = "true" ]; then
        exit 1
      fi
      ;;
  esac
fi

# 1. Run Migrations (required)
if [ "$MIGRATE_DB" = "true" ] && [ -n "$DATABASE_URL" ]; then
  echo "Running Prisma migrations..."
  attempt=1
  while [ "$attempt" -le "$MIGRATE_RETRIES" ]; do
    if command -v prisma >/dev/null 2>&1; then
      prisma migrate deploy && break
    else
      npx --yes prisma migrate deploy && break
    fi

    echo "Prisma migrations failed (attempt $attempt/$MIGRATE_RETRIES)"
    if [ "$attempt" -ge "$MIGRATE_RETRIES" ]; then
      if [ "$STRICT_DB" = "true" ]; then
        echo "STRICT_DB=true -> exiting after migration failures"
        exit 1
      fi
      echo "Continuing without applying migrations"
      break
    fi

    sleep "$MIGRATE_SLEEP_SECONDS"
    attempt=$((attempt + 1))
  done
fi

# 2. Seed Database
if [ "$SEED_DB" = "true" ]; then
  echo "🌱 Seeding database..."
  npm run seed
fi

# 3. Start Application
exec "$@"
