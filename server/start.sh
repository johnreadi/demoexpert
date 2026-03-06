#!/bin/sh
echo "--- STARTING BACKEND SCRIPT ---"
echo "PORT: $PORT"
echo "NODE_ENV: $NODE_ENV"

# Mask password in DB URL for logs (basic masking)
if [ -n "$DATABASE_URL" ]; then
  SAFE_DB_URL=$(echo "$DATABASE_URL" | sed 's/:[^:]*@/:***@/')
  echo "DATABASE_URL: $SAFE_DB_URL"
else
  echo "DATABASE_URL is not set!"
fi

# Try migration with timeout
echo "--- RUNNING MIGRATIONS ---"
# We use a simple timeout approach if 'timeout' command is available, otherwise just run
if command -v timeout >/dev/null 2>&1; then
    timeout 15s npx prisma migrate deploy
else
    npx prisma migrate deploy
fi
MIGRATE_EXIT=$?
echo "Migration exit code: $MIGRATE_EXIT"

# Start the app
echo "--- STARTING APP ---"
npm start
APP_EXIT=$?
echo "App exit code: $APP_EXIT"

# If we get here, the app crashed or exited.
echo "--- APP CRASHED, STARTING FALLBACK SERVER ---"
node fallback.js
