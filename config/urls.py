"""
Remote Team Manager
Main URL Configuration
config/urls.py
"""

from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse


def health_check(request):
    """Health check endpoint for deployment monitoring."""
    return JsonResponse({'status': 'ok', 'message': 'Remote Team Manager is running'})


urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),

    # Health check
    path('api/health/', health_check, name='health-check'),

    # API routes (added day by day)
    # path('api/auth/', include('apps.users.urls')),
    # path('api/workspaces/', include('apps.workspaces.urls')),
    # path('api/projects/', include('apps.projects.urls')),
    # path('api/tasks/', include('apps.tasks.urls')),
]
