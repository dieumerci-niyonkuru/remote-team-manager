#!/bin/bash
set -e
echo "=== RemoteTeam Enterprise Boot ==="

# Environment validation
if [ -z "$SECRET_KEY" ] || [ "$SECRET_KEY" = "django-insecure-9!@#\$%^&*()_+abcdefghijklmnopqrstuvwxyz123456" ]; then
  echo "WARNING: Using default insecure SECRET_KEY. Set SECRET_KEY in production!"
fi

# Ensure staticfiles directory (required by WhiteNoise)
mkdir -p staticfiles

# ── Wait for database (PostgreSQL readiness) ──────────────────────────────────
echo "Waiting for database..."
DB_READY=false
for i in $(seq 1 30); do
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
  echo "  Database not ready — attempt $i/30, retrying in 2s..."
  sleep 2
done

if [ "$DB_READY" = false ]; then
  echo "ERROR: Database never became ready — aborting."
  exit 1
fi

# ── Pre-migrate: ensure migration records match what's already in the DB ───────
# This handles the case where tables exist (from old deployments) but the
# django_migrations table is missing the corresponding records. We insert
# fake records so Django's migrate --fake-initial can proceed cleanly.
echo "Pre-migration state check..."
python - <<'PYEOF'
import os, sys
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()
from django.db import connection

def table_exists(cursor, name):
    """Check if a table exists in the public schema (PostgreSQL) or at all (SQLite)."""
    try:
        cursor.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_schema = 'public'
                AND table_name = %s
            )
        """, [name])
        row = cursor.fetchone()
        return bool(row and row[0])
    except Exception:
        # SQLite fallback
        try:
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?", [name])
            return cursor.fetchone() is not None
        except Exception:
            return False

def migrations_table_exists(cursor):
    return table_exists(cursor, 'django_migrations')

def get_applied(cursor, app):
    try:
        cursor.execute("SELECT name FROM django_migrations WHERE app=%s", [app])
        return [r[0] for r in cursor.fetchall()]
    except Exception:
        return []

def insert_fake_migration(cursor, app, name):
    from django.utils import timezone
    try:
        cursor.execute(
            "INSERT INTO django_migrations (app, name, applied) VALUES (%s, %s, %s) "
            "ON CONFLICT DO NOTHING",
            [app, name, timezone.now()]
        )
        print(f"  [fake] Recorded {app}.{name}")
    except Exception as e:
        print(f"  [warn] Could not fake {app}.{name}: {e}")

with connection.cursor() as c:
    if not migrations_table_exists(c):
        print("[pre-migrate] Fresh database — django_migrations doesn't exist yet. Proceeding cleanly.")
        sys.exit(0)

    # ── Chat: the most common offender ────────────────────────────────────────
    applied_chat = get_applied(c, 'chat')
    chat_tables_exist = table_exists(c, 'chat_chatroom') and table_exists(c, 'chat_message')

    if chat_tables_exist and '0001_initial' not in applied_chat:
        print("[pre-migrate] chat tables exist but 0001_initial not recorded — faking...")
        # Clear any stale/partial chat migration records first
        try:
            c.execute("DELETE FROM django_migrations WHERE app='chat'")
        except Exception:
            pass
        insert_fake_migration(c, 'chat', '0001_initial')
    elif any('0002' in m for m in applied_chat):
        # Old 2-migration schema: clear all chat records and let --fake-initial handle it
        print("[pre-migrate] Old chat 0002 record detected — clearing for fresh fake-initial run...")
        try:
            c.execute("DELETE FROM django_migrations WHERE app='chat'")
        except Exception:
            pass
    else:
        print(f"[pre-migrate] Chat state OK (applied: {applied_chat or 'none yet'})")

    # ── Celery beat / results: new apps added recently, ensure they're fine ───
    for app, marker_table in [
        ('django_celery_results', 'django_celery_results_taskresult'),
        ('django_celery_beat',    'django_celery_beat_periodictask'),
    ]:
        applied = get_applied(c, app)
        if not applied:
            print(f"[pre-migrate] {app}: no records — will be migrated fresh (OK)")
        else:
            print(f"[pre-migrate] {app}: {len(applied)} migration(s) recorded (OK)")

    print("[pre-migrate] State check complete.")
PYEOF

# ── Run migrations with --fake-initial ────────────────────────────────────────
# --fake-initial: for each app's 0001_initial migration, if ALL the tables it
# would create already exist in the database, Django marks it as applied
# WITHOUT running it. This is the correct fix for "relation already exists".
echo "Running migrations (--fake-initial)..."
python manage.py migrate --noinput --verbosity=1 --fake-initial

# ── Verify critical tables exist (non-fatal — log only) ───────────────────────
echo "Verifying schema..."
python - <<'PYEOF'
import os, sys
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()
from django.db import connection

tables = connection.introspection.table_names()
required = [
    'chat_chatroom', 'chat_message',
    'accounts_user', 'workspaces_workspace',
    'notifications_notification', 'notifications_invite',
    'projects_project', 'projects_task',
]
missing = [t for t in required if t not in tables]
if missing:
    print(f"WARNING: Missing tables after migration: {missing}")
    print(f"  Total tables present: {len(tables)}")
    print("  Server will start anyway — check your migration files.")
else:
    print(f"Schema OK — {len(tables)} tables verified.")
PYEOF

# ── Collect static files ───────────────────────────────────────────────────────
echo "Collecting static files..."
python manage.py collectstatic --noinput --clear 2>&1 || echo "WARNING: collectstatic failed (non-fatal)"

# ── Start Daphne ───────────────────────────────────────────────────────────────
PORT="${PORT:-8080}"
echo "Starting Daphne on 0.0.0.0:$PORT..."
exec daphne -b 0.0.0.0 -p "$PORT" config.asgi:application
