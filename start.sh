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

# ── Pre-migrate: clean up stale chat tables from old 2-migration approach ─────
echo "Checking chat migration state for clean slate..."
python - <<'PYEOF'
import os, sys
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()
from django.db import connection

STALE_TABLES = [
    'chat_messagereaction', 'chat_channelmembership',
    'chat_channel_members', 'chat_channel',
    'chat_directmessage_participants', 'chat_directmessage',
]

with connection.cursor() as c:
    # Check if django_migrations table exists at all (fresh DB has none)
    try:
        c.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_schema = 'public'
                AND table_name = 'django_migrations'
            )
        """)
        row = c.fetchone()
        migrations_table_exists = row[0] if row else False
    except Exception:
        # SQLite or other DB — fall back
        try:
            c.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='django_migrations'")
            migrations_table_exists = c.fetchone() is not None
        except Exception as e:
            print(f"[pre-migrate] Could not check migrations table: {e}")
            sys.exit(0)

    if not migrations_table_exists:
        print("[pre-migrate] Fresh database — no migrations yet. Proceeding cleanly.")
        sys.exit(0)

    try:
        c.execute("SELECT name FROM django_migrations WHERE app='chat'")
        applied = [r[0] for r in c.fetchall()]
    except Exception as e:
        print(f"[pre-migrate] Could not query chat migrations: {e}")
        sys.exit(0)

    # If the old migration 0002 was recorded, clear stale records
    if any('0002' in m for m in applied):
        print("[pre-migrate] Old chat 0002 migration record found — clearing for clean 0001 run...")
        for tbl in STALE_TABLES:
            try:
                c.execute(f'DROP TABLE IF EXISTS "{tbl}" CASCADE')
                print(f"  dropped stale table: {tbl}")
            except Exception as e:
                print(f"  [warn] {tbl}: {e}")
        try:
            c.execute("DELETE FROM django_migrations WHERE app='chat'")
            print("[pre-migrate] Chat migration records cleared.")
        except Exception as e:
            print(f"[pre-migrate] [warn] Could not clear migration records: {e}")
    else:
        print("[pre-migrate] Chat migration state is clean.")
PYEOF

# ── Run migrations ─────────────────────────────────────────────────────────────
echo "Running migrations..."
python manage.py migrate --noinput --verbosity=1

# ── Verify critical tables exist (non-fatal — log only) ───────────────────────
echo "Verifying schema..."
python - <<'PYEOF'
import os, sys
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()
from django.db import connection

tables = connection.introspection.table_names()
required = ['chat_chatroom', 'chat_message', 'accounts_user', 'workspaces_workspace', 'notifications_notification']
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
WORKERS="${WEB_CONCURRENCY:-4}"
echo "Starting Daphne on 0.0.0.0:$PORT (workers: $WORKERS)..."
exec daphne -b 0.0.0.0 -p "$PORT" config.asgi:application
