#!/bin/bash
set -e
echo "=== RemoteTeam Enterprise Boot ==="

# Environment validation
if [ -z "$SECRET_KEY" ] || [ "$SECRET_KEY" = "django-insecure-9!@#\$%^&*()_+abcdefghijklmnopqrstuvwxyz123456" ]; then
  echo "WARNING: Using default insecure SECRET_KEY. Set SECRET_KEY in production!"
fi

# Ensure staticfiles directory (required by WhiteNoise)
mkdir -p staticfiles

# Wait for database (PostgreSQL readiness)
echo "Waiting for database..."
for i in $(seq 1 30); do
  python manage.py check --database default >/dev/null 2>&1 && break
  echo "  Database not ready — attempt $i/30, retrying in 2s..."
  sleep 2
done

# Pre-migrate: clean up any stale chat tables from the old 2-migration approach.
# Since we replaced the broken migration 0002 with a clean 0001 (single migration),
# we must ensure no leftover tables/migration records block the fresh run.
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
    try:
        c.execute("SELECT name FROM django_migrations WHERE app='chat'")
        applied = [r[0] for r in c.fetchall()]
    except Exception as e:
        print(f"[pre-migrate] Could not query migrations: {e}")
        sys.exit(0)

    # If the old migration 0002 was recorded but our new 0001 covers everything,
    # clear stale records so Django can re-run cleanly.
    if any('0002' in m for m in applied):
        print("[pre-migrate] Old migration records found — clearing for clean 0001 run...")
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
            print(f"[pre-migrate] [warn] {e}")
    else:
        print("[pre-migrate] Chat migration state is clean.")
PYEOF

# Validate Django configuration
echo "Validating Django config..."
python manage.py check --deploy 2>&1 | grep -E '(ERROR|CRITICAL)' || echo "  Config OK (warnings are non-fatal)"

# Run migrations with verbose output for debugging
echo "Running migrations..."
python manage.py migrate --noinput --verbosity=1

# Verify critical tables exist
echo "Verifying schema..."
python manage.py shell -c "
from django.db import connection
tables = connection.introspection.table_names()
required = ['chat_chatroom', 'chat_message', 'accounts_user', 'workspaces_workspace', 'notifications_notification']
missing = [t for t in required if t not in tables]
if missing:
    print(f'ERROR: Missing tables: {missing}')
    exit(1)
print(f'Schema OK — {len(tables)} tables')
"

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput --clear 2>&1 || echo "WARNING: collectstatic failed (non-fatal)"

# Start server
PORT="${PORT:-8080}"
echo "Starting Daphne on 0.0.0.0:$PORT..."
exec daphne -b 0.0.0.0 -p "$PORT" config.asgi:application
