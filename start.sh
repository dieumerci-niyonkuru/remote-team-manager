#!/bin/bash
set -e
echo "=== RemoteTeam Server Boot ==="

# Wait for database
echo "Waiting for database..."
for i in {1..30}; do
  python manage.py check --database default >/dev/null 2>&1 && break
  echo "Database not ready - sleeping 1s (attempt $i/30)"
  sleep 1
done

# Run migrations
echo "Running migrations..."
python manage.py migrate --noinput

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput --clear 2>/dev/null || true

# Start server with daphne (supports HTTP + WebSocket)
PORT="${PORT:-8080}"
echo "Starting Daphne on port $PORT..."
exec daphne -b 0.0.0.0 -p "$PORT" config.asgi:application
