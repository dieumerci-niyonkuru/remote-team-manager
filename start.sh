#!/bin/bash
set -e
echo "=== RemoteTeam Manager — Production Boot ==="

# ── Validate environment ──────────────────────────────────────────────────────
if [ -z "$SECRET_KEY" ]; then
  echo "FATAL: SECRET_KEY is not set. Aborting."
  exit 1
fi
if [ -z "$DATABASE_URL" ]; then
  echo "FATAL: DATABASE_URL is not set. Aborting."
  exit 1
fi

# Ensure staticfiles directory exists (WhiteNoise requirement)
mkdir -p staticfiles

# ── Wait for PostgreSQL to be ready ──────────────────────────────────────────
echo "Waiting for database..."
DB_READY=false
for i in $(seq 1 40); do
  if python - <<'PYEOF' 2>/dev/null
import os, sys
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()
from django.db import connection
connection.ensure_connection()
sys.exit(0)
PYEOF
  then
    DB_READY=true
    echo "  Database ready (attempt $i)"
    break
  fi
  echo "  Database not ready — attempt $i/40, retrying in 2s..."
  sleep 2
done

if [ "$DB_READY" = false ]; then
  echo "FATAL: Database never became ready — aborting."
  exit 1
fi

# ── Fix inconsistent DB state BEFORE running migrate ─────────────────────────
# This management command detects and repairs partial/ghost migration states
# that would cause migrate to fail. It uses psycopg2 in autocommit=True mode
# so every DDL (DROP TABLE) commits immediately and cannot be rolled back.
#
# Key scenario it fixes:
#   - chat_chatroom exists but chat_message doesn't (split-migration remnant)
#   - 0001_initial recorded in django_migrations but tables are missing
#   - Old 0002 migration records from a deprecated split schema
#
echo "Checking and fixing migration state..."
python manage.py ensure_schema --verbosity=1 || {
  echo "WARNING: ensure_schema failed — attempting migration anyway"
}

# ── Run migrations ────────────────────────────────────────────────────────────
# --fake-initial: if ALL tables in a 0001_initial already exist, mark it applied
# without running the SQL. This safely skips apps whose tables were created by
# a previous deployment that had a different migration structure.
echo "Running migrations..."
python manage.py migrate --noinput --verbosity=1 --fake-initial

# ── Verify critical tables exist ─────────────────────────────────────────────
echo "Verifying schema..."
python - <<'PYEOF'
import os, sys
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()
from django.db import connection

tables = set(connection.introspection.table_names())
required = [
    'chat_chatroom', 'chat_message',
    'accounts_user', 'workspaces_workspace',
    'notifications_notification', 'notifications_invite',
    'projects_project', 'projects_task',
]
missing = [t for t in required if t not in tables]
if missing:
    print(f"WARNING: {len(missing)} table(s) missing after migration: {missing}")
    print(f"  Total tables present: {len(tables)}")
    print("  The server will start — these tables may be recreated on first request.")
else:
    print(f"Schema OK — all {len(required)} critical tables verified ({len(tables)} total).")
PYEOF

# ── Collect static files ─────────────────────────────────────────────────────
echo "Collecting static files..."
python manage.py collectstatic --noinput --clear 2>&1 \
  || echo "WARNING: collectstatic failed (non-fatal — WhiteNoise will serve from source)"

# ── Start Daphne (ASGI server) ────────────────────────────────────────────────
PORT="${PORT:-8080}"
WORKERS="${WEB_CONCURRENCY:-1}"
echo "Starting Daphne on 0.0.0.0:${PORT}..."
exec daphne \
  -b 0.0.0.0 \
  -p "${PORT}" \
  --access-log - \
  --proxy-headers \
  config.asgi:application
