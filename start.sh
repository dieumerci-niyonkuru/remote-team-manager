#!/bin/bash
set -e
echo "=== RemoteTeam Server Boot ==="

# Ensure staticfiles directory exists (required by WhiteNoise)
mkdir -p staticfiles

# Wait for database
echo "Waiting for database..."
for i in {1..30}; do
  python manage.py check --database default >/dev/null 2>&1 && break
  echo "Database not ready - sleeping 1s (attempt $i/30)"
  sleep 1
done

# ── Pre-migrate: fix broken chat migration state ─────────────────────────────
# If chat.0002 has never successfully applied, the DB may have stale/missing
# tables from previous failed attempts. Nuke them so 0001 + 0002 run cleanly.
echo "Checking chat migration state..."
python - <<'PYEOF'
import os, sys
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()
from django.db import connection

OLD_TABLES = [
    'chat_messagereaction', 'chat_message', 'chat_channelmembership',
    'chat_channel_members', 'chat_channel',
    'chat_directmessage_participants', 'chat_directmessage',
    'chat_chatroom_participants', 'chat_chatroom',
]

with connection.cursor() as c:
    # Check whether chat.0002 has already been recorded as applied
    try:
        c.execute(
            "SELECT 1 FROM django_migrations "
            "WHERE app='chat' AND name LIKE '0002%' LIMIT 1"
        )
        already_done = c.fetchone() is not None
    except Exception as e:
        print(f"[pre-migrate] Could not query django_migrations: {e}")
        already_done = False

    if already_done:
        print("[pre-migrate] chat.0002 already applied — nothing to do.")
        sys.exit(0)

    print("[pre-migrate] chat.0002 not yet applied — dropping stale tables...")
    for tbl in OLD_TABLES:
        try:
            c.execute(f'DROP TABLE IF EXISTS "{tbl}" CASCADE')
            print(f"  dropped {tbl}")
        except Exception as e:
            print(f"  [warn] could not drop {tbl}: {e}")

    try:
        c.execute("DELETE FROM django_migrations WHERE app='chat'")
        print("[pre-migrate] chat migration records cleared.")
    except Exception as e:
        print(f"[pre-migrate] [warn] could not clear migration records: {e}")

    print("[pre-migrate] Done — chat will migrate from scratch.")
PYEOF

# Run migrations
echo "Running migrations..."
python manage.py migrate --noinput

# Collect static files (non-fatal — app still works without them)
echo "Collecting static files..."
python manage.py collectstatic --noinput --clear 2>&1 || echo "WARNING: collectstatic failed (non-fatal)"

# Start server with daphne (supports HTTP + WebSocket)
PORT="${PORT:-8080}"
echo "Starting Daphne on port $PORT..."
exec daphne -b 0.0.0.0 -p "$PORT" config.asgi:application
