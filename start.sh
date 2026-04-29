#!/bin/bash
set -e
echo "=== Starting Gunicorn ==="
exec gunicorn config.wsgi:application \
  --bind 0.0.0.0:$PORT \
  --workers 2 \
  --timeout 120 \
  --log-level debug \
  --access-logfile -
