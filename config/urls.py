from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.utils import timezone
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView


def health_check(request):
    return JsonResponse({
        'status': 'ok',
        'message': 'Remote Team Manager is running',
        'timestamp': timezone.now().isoformat(),
        'version': '1.0.0',
    })


urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),

    # Health check
    path('api/health/', health_check, name='health-check'),

    # API Docs
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    # Auth
    path('api/auth/', include('apps.users.urls')),

    # Workspaces
    path('api/workspaces/', include('apps.workspaces.urls')),

    # Projects
    path('api/workspaces/<uuid:workspace_pk>/projects/', include('apps.projects.urls')),

    # Tasks
    path('api/workspaces/<uuid:workspace_pk>/projects/<uuid:project_pk>/tasks/', include('apps.tasks.urls')),

    # Activity Feed
    path('api/workspaces/<uuid:workspace_pk>/activity/', include([
        path('', __import__('apps.tasks.views', fromlist=['activity_feed']).activity_feed, name='activity-feed'),
    ])),
]
