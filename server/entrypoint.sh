#!/bin/sh
set -e

echo "--- 🚀 STARTUP SCRIPT (entrypoint.sh) ---"

# 🔧 FIX: Dokploy injects DATABASE_URL with default 'postgres' DB name.
# We must correct it to 'demoexpert-expertdb-djopvt' BEFORE initializing Prisma migrations.
if [ -n "$DATABASE_URL" ]; then
  echo "Checking DATABASE_URL..."
  # Use shell parameter expansion to replace /postgres with /demoexpert-expertdb-djopvt
  # Note: This is a simple string replacement.
  # If the URL ends with /postgres, replace it.
  case "$DATABASE_URL" in
    */postgres)
      echo "⚠️ Fixing DATABASE_URL: Changing target DB from 'postgres' to 'demoexpert-expertdb-djopvt'"
      export DATABASE_URL="${DATABASE_URL%/postgres}/demoexpert-expertdb-djopvt"
      ;;
    */postgres?*)
      # Handle cases with query parameters
      echo "⚠️ Fixing DATABASE_URL (with query params): Changing target DB from 'postgres' to 'demoexpert-expertdb-djopvt'"
      export DATABASE_URL=$(echo "$DATABASE_URL" | sed 's|/postgres|/demoexpert-expertdb-djopvt|')
      ;;
  esac
fi

echo "DATABASE_URL is set (masked): $(echo $DATABASE_URL | sed 's/:[^:@]*@/:****@/')"

# 1. Run Migrations (Safe to run on every startup, idempotent)
echo "Running Prisma migrations..."
# Use || true to prevent startup failure if DB is temporarily unreachable
# (The app will retry connection in background)
npx prisma migrate deploy || echo "⚠️ Migration failed, skipping..."

# 2. Generate Client (Should be done in build, but safe to redo)
# echo "Generating Prisma Client..."
# npx prisma generate || echo "⚠️ Generation failed, skipping..."

# 3. Start Application
echo "Starting Node.js application..."
exec "$@"
