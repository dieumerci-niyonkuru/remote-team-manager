from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.conf import settings
from django.conf.urls.static import static
from apps.workspaces.views import GlobalSearchView
import datetime


def health_check(request):
    return JsonResponse({
        'status': 'ok',
        'timestamp': datetime.datetime.now().isoformat(),
        'version': '1.0.0'
    })


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', health_check, name='health'),
    path('api/auth/', include('apps.accounts.urls')),
    path('api/ai-suggestions/', include('apps.ai.urls')),
    path('api/ai/', include('apps.ai.urls')),
    path('api/search/', GlobalSearchView.as_view(), name='global-search'),
    path('api/', include('config.api_router')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
