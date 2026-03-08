#!/bin/sh
set -e

echo "--- 🚀 STARTUP SCRIPT (entrypoint.sh) ---"

# 🔧 FIX ENABLED: Ensure we connect to the correct database name
if [ -n "$DATABASE_URL" ]; then
  echo "Checking DATABASE_URL..."
  case "$DATABASE_URL" in
    */postgres)
      echo "⚠️ Fixing DATABASE_URL: Changing target DB from 'postgres' to 'demoexpert-expertdb-djopvt'"
      export DATABASE_URL="${DATABASE_URL%/postgres}/demoexpert-expertdb-djopvt"
      ;;
    */postgres?*)
      echo "⚠️ Fixing DATABASE_URL (with query params): Changing target DB from 'postgres' to 'demoexpert-expertdb-djopvt'"
      export DATABASE_URL=$(echo "$DATABASE_URL" | sed 's|/postgres|/demoexpert-expertdb-djopvt|')
      ;;
  esac
fi

echo "DATABASE_URL is set (masked): $(echo $DATABASE_URL | sed 's/:[^:@]*@/:****@/')"

# 1. Run Migrations - use --skip-generate to avoid issues, fallback to db push
echo "Running Prisma migrations..."
if command -v prisma >/dev/null 2>&1; then
  prisma migrate deploy || {
    echo "⚠️ migrate deploy failed, trying db push..."
    prisma db push --accept-data-loss || echo "⚠️ db push also failed, continuing..."
  }
else
  npx --yes prisma migrate deploy || {
    echo "⚠️ migrate deploy failed, trying db push..."
    npx --yes prisma db push --accept-data-loss || echo "⚠️ db push also failed, continuing..."
  }
fi

# 2. Seed Database
if [ "$SEED_DB" = "true" ]; then
  echo "🌱 Seeding database..."
  npm run seed || echo "⚠️ Seeding failed (non-critical)"
fi

# 3. Start Application
exec "$@"
