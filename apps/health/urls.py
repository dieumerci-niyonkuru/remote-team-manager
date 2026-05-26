"""
Health check endpoint for Railway and monitoring services.
Returns 200 OK even if some dependencies are degraded (to prevent restart loops).
Only returns 503 if the database (core dependency) is completely unreachable.
"""
import datetime
from django.urls import path
from django.http import JsonResponse


def health(request):
    checks = {}
    overall = 'ok'

    # ── Database ──────────────────────────────────────────────────────────────
    try:
        from django.db import connection
        with connection.cursor() as cur:
            cur.execute('SELECT 1')
        checks['database'] = 'ok'
    except Exception as exc:
        checks['database'] = f'error: {exc}'
        overall = 'degraded'

    # ── Redis / Channel Layer ─────────────────────────────────────────────────
    try:
        from django.conf import settings
        import redis
        redis_url = (
            settings.CHANNEL_LAYERS.get('default', {})
            .get('CONFIG', {})
            .get('hosts', [None])[0]
        )
        if redis_url and isinstance(redis_url, str):
            r = redis.from_url(redis_url, socket_connect_timeout=2)
            r.ping()
            checks['redis'] = 'ok'
        else:
            checks['redis'] = 'in-memory (no Redis configured)'
    except Exception as exc:
        checks['redis'] = f'error: {exc}'
        overall = 'degraded'

    # ── Return ────────────────────────────────────────────────────────────────
    payload = {
        'status': overall,
        'timestamp': datetime.datetime.utcnow().isoformat() + 'Z',
        'version': '1.0.0',
        'checks': checks,
    }
    # Only 503 if the DB is completely down (critical); degrade gracefully otherwise
    http_status = 503 if checks.get('database', '').startswith('error') else 200
    return JsonResponse(payload, status=http_status)


urlpatterns = [
    path('', health, name='health'),
]
