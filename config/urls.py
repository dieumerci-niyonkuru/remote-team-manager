from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from apps.workspaces.views import GlobalSearchView
from apps.auth.health import HealthCheckView
from apps.health.urls import health as health_check

urlpatterns = [
    path('admin/', admin.site.urls),
    # Primary health check: 200 ok/degraded, 503 only if DB is completely unreachable
    path('api/health/', health_check, name='health'),
    # Extended: also reports pending migrations and cache status
    path('api/health/extended/', HealthCheckView.as_view(), name='health-extended'),
    path('api/auth/', include('apps.accounts.urls')),
    # AI suggestions — canonical URL used by the frontend
    path('api/ai-suggestions/', include('apps.ai.urls')),
    path('api/search/', GlobalSearchView.as_view(), name='global-search'),
    path('api/', include('config.api_router')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
