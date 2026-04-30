from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.utils import timezone

def health_check(request):
    return JsonResponse({'status': 'ok', 'message': 'Running', 'timestamp': timezone.now().isoformat()})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', health_check),
    path('api/auth/', include('apps.users.urls')),
    path('api/workspaces/', include('apps.workspaces.urls')),
    path('api/workspaces/<uuid:workspace_pk>/projects/', include('apps.projects.urls')),
    path('api/workspaces/<uuid:workspace_pk>/projects/<uuid:project_pk>/tasks/', include('apps.tasks.urls')),
]
