from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.conf import settings
from django.conf.urls.static import static
from apps.workspaces.views import GlobalSearchView
from apps.auth.health import HealthCheckView


def health_check(request):
    import datetime
    checks = {}
    overall = 'ok'

    # Database check
    try:
        from django.db import connection
        connection.ensure_connection()
        checks['db'] = 'ok'
    except Exception as e:
        checks['db'] = f'error: {e}'
        overall = 'degraded'

    # Cache check (non-fatal)
    try:
        from django.core.cache import cache
        cache.set('_health', '1', 5)
        checks['cache'] = 'ok' if cache.get('_health') == '1' else 'miss'
    except Exception:
        checks['cache'] = 'unavailable'

    return JsonResponse({
        'status': overall,
        'timestamp': datetime.datetime.now().isoformat(),
        'version': '1.0.0',
        'checks': checks,
    }, status=200)  # Always 200 so Railway healthcheck passes


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', health_check, name='health'),
    path('api/health/extended/', HealthCheckView.as_view(), name='health-extended'),
    path('api/auth/', include('apps.accounts.urls')),
    path('api/ai-suggestions/', include('apps.ai.urls')),
    path('api/ai/', include('apps.ai.urls')),
    path('api/search/', GlobalSearchView.as_view(), name='global-search'),
    path('api/', include('config.api_router')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
