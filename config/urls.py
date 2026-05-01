from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def health_check(request):
    return JsonResponse({'status': 'ok'})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', health_check, name='health'),
    path('api/accounts/', include('apps.accounts.urls')),
    path('api/', include('apps.workspaces.urls')),
    path('api/', include('apps.projects.urls')),
    path('api/', include('apps.chat.urls')),
    path('api/', include('apps.hr.urls')),
    path('api/', include('apps.notifications.urls')),
    path('api/', include('apps.presence.urls')),
]
