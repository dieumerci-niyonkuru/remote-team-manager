#!/bin/bash
set -e

# Wait for the database to be ready (max 30 seconds)
echo "Waiting for database..."
for i in {1..30}; do
  python manage.py check --database default >/dev/null 2>&1 && break
  echo "Database not ready - sleeping 1s (attempt $i/30)"
  sleep 1
done

echo "Running migrations..."
python manage.py migrate --noinput

echo "Starting Gunicorn..."
exec gunicorn config.wsgi:application \
  --bind 0.0.0.0:8000 \
  --workers 2 \
  --timeout 120 \
  --log-level info \
  --access-logfile -
