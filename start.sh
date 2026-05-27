#!/bin/bash
set -euo pipefail
echo "=== RemoteTeam Manager — Production Boot ==="
echo "    Python: $(python --version)"
echo "    Django: $(python -c 'import django; print(django.__version__)')"

# ── Validate required environment ─────────────────────────────────────────────
if [ -z "${SECRET_KEY:-}" ]; then
  echo "FATAL: SECRET_KEY is not set. Aborting." >&2
  exit 1
fi
if [ -z "${DATABASE_URL:-}" ]; then
  echo "FATAL: DATABASE_URL is not set. Aborting." >&2
  exit 1
fi

# ── Report frontend build status ──────────────────────────────────────────────
if [ -f "/app/dist/index.html" ]; then
  echo "✓ React frontend build present (dist/index.html found)"
else
  echo "⚠  dist/index.html not found — SPA routes will show a fallback page."
  echo "   The API is still available at /api/."
fi

# ── Ensure required directories exist ─────────────────────────────────────────
# Non-fatal: both dirs are pre-created in Dockerfile.prod with correct ownership.
# This line is a safety net for edge cases (e.g. volume mounts, local dev).
mkdir -p staticfiles media 2>/dev/null || true

# ── Wait for PostgreSQL ───────────────────────────────────────────────────────
echo "Waiting for database to be ready..."
DB_READY=false
for i in $(seq 1 40); do
  if python - <<'PYEOF' 2>/dev/null
import os, sys, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
from django.db import connection
connection.ensure_connection()
sys.exit(0)
PYEOF
  then
    DB_READY=true
    echo "  ✓ Database ready (attempt $i)"
    break
  fi
  echo "  Database not ready — attempt $i/40, retrying in 2s..."
  sleep 2
done

if [ "$DB_READY" = false ]; then
  echo "FATAL: Database never became ready after 80 s — aborting." >&2
  exit 1
fi

# ── Fix inconsistent migration state ──────────────────────────────────────────
echo "Checking migration state..."
python manage.py ensure_schema --verbosity=1 2>/dev/null || {
  echo "  ensure_schema not available or failed — continuing..."
}

# ── Apply migrations ──────────────────────────────────────────────────────────
echo "Running migrations..."
python manage.py migrate --noinput --verbosity=1 --fake-initial

# ── Verify critical tables ────────────────────────────────────────────────────
echo "Verifying schema..."
python - <<'PYEOF'
import os, sys, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
from django.db import connection

tables = set(connection.introspection.table_names())
required = [
    'accounts_user', 'workspaces_workspace',
    'projects_project', 'projects_task',
    'chat_chatroom', 'chat_message',
    'notifications_notification',
]
missing = [t for t in required if t not in tables]
if missing:
    print(f"  ⚠  {len(missing)} table(s) missing: {missing}")
else:
    print(f"  ✓ Schema OK — {len(tables)} tables present, all critical tables verified")
PYEOF

# ── Collect static files (Django admin / DRF UI — NOT the React build) ────────
echo "Collecting Django static files..."
python manage.py collectstatic --noinput --clear 2>&1 | tail -3 || \
  echo "  WARNING: collectstatic failed (non-fatal)"

# ── Start Daphne (ASGI — required for Django Channels WebSockets) ─────────────
PORT="${PORT:-8080}"
echo ""
echo "=== Starting Daphne on 0.0.0.0:${PORT} ==="
echo "    API     → http://0.0.0.0:${PORT}/api/"
echo "    Admin   → http://0.0.0.0:${PORT}/admin/"
echo "    Health  → http://0.0.0.0:${PORT}/api/health/"
echo "    SPA     → http://0.0.0.0:${PORT}/"
echo ""

exec daphne \
  -b 0.0.0.0 \
  -p "${PORT}" \
  --access-log - \
  --proxy-headers \
  config.asgi:application
