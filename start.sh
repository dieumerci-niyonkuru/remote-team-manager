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

# ── Repair migration history inconsistencies ───────────────────────────────────
# Problem: the production DB can end up with a higher-numbered migration recorded
# (e.g. presence.0002_presence_availability) but its dependency (0001_initial)
# missing from django_migrations. Django's migrate command raises
# InconsistentMigrationHistory before --fake-initial can help.
#
# Fix: walk the migration dependency graph, find any applied migration whose
# dependencies are NOT recorded, and fake-apply those missing records so that
# the history is consistent before the real migrate run.
echo "Repairing migration history inconsistencies..."
python - <<'PYEOF' 2>&1 || echo "  Migration repair check skipped (non-fatal)"
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.db import connection
from django.db.migrations.loader import MigrationLoader
from django.db.migrations.recorder import MigrationRecorder

# Load the migration state without triggering the consistency check
loader = MigrationLoader(connection, ignore_no_migrations=True)
applied = set(loader.applied_migrations.keys())

# Collect dependencies of applied migrations that are not themselves applied
missing_deps = set()
for key in applied:
    node = loader.graph.nodes.get(key)
    if node is None:
        continue
    for dep in node.dependencies:
        # Only care about real app migrations, not Django's internal __setting__ deps
        if (isinstance(dep, tuple) and len(dep) == 2
                and dep[0] != '__setting__'
                and dep not in applied):
            missing_deps.add(dep)

if not missing_deps:
    print("  ✓ Migration history is consistent — nothing to repair")
else:
    recorder = MigrationRecorder(connection)
    for app, name in sorted(missing_deps):
        recorder.record_applied(app, name)
        print(f"  ✓ Faked missing dependency: {app}.{name}")
    print(f"  Repaired {len(missing_deps)} missing migration record(s)")
PYEOF

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

# ── Seed demo data (idempotent) ───────────────────────────────────────────────
# Populates the "Nexus Labs" demo workspace and its 7 demo users so the deployed
# site is immediately loginnable (demo@nexuslabs.io / demo1234). Uses
# get_or_create throughout, so it is safe to run on every boot. Disable by
# setting SEED_DEMO_DATA=false in the environment.
if [ "${SEED_DEMO_DATA:-true}" = "true" ]; then
  echo "Seeding demo data..."
  python manage.py seed_demo || echo "  WARNING: seed_demo failed (non-fatal)"
else
  echo "Skipping demo seed (SEED_DEMO_DATA is not 'true')"
fi

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
