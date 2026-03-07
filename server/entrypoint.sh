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

# 1. Run Diagnostic Connection Test (Added for debugging)
echo "--- 🔍 DATABASE DIAGNOSTIC START ---"
if [ -f "./test-db-connection.js" ]; then
  node ./test-db-connection.js || echo "Diagnostic failed (non-critical)"
else
  echo "⚠️ Diagnostic script not found!"
fi
echo "--- 🔍 DATABASE DIAGNOSTIC END ---"

# 2. Run Migrations (Safe to run on every startup, idempotent)
echo "Running Prisma migrations..."
# Use --yes to skip interactive prompts if npx is used
# Or if prisma is installed globally, use it directly
if command -v prisma >/dev/null 2>&1; then
  prisma migrate deploy || echo "⚠️ Migration failed (prisma global), skipping..."
else
  npx --yes prisma migrate deploy || echo "⚠️ Migration failed (npx), skipping..."
fi

# 2. Generate Client (Should be done in build, but safe to redo)
# echo "Generating Prisma Client..."
# npx prisma generate || echo "⚠️ Generation failed, skipping..."

# 3. Start Application
echo "Starting Node.js application..."
exec "$@"
