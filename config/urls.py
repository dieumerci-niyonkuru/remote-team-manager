from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse


def health_check(request):
    return JsonResponse({'status': 'ok', 'message': 'Remote Team Manager is running'})


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', health_check, name='health-check'),
    path('api/auth/', include('apps.users.urls')),
    path('api/workspaces/', include('apps.workspaces.urls')),
    path('api/workspaces/<uuid:workspace_pk>/projects/', include('apps.projects.urls')),
    path('api/workspaces/<uuid:workspace_pk>/projects/<uuid:project_pk>/tasks/', include('apps.tasks.urls')),
    path('api/workspaces/<uuid:workspace_pk>/activity/', include([
        path('', __import__('apps.tasks.views', fromlist=['activity_feed']).activity_feed, name='activity-feed'),
    ])),
]
