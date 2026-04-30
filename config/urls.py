from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

def health_check(request):
    return JsonResponse({'status': 'ok'})

schema_view = get_schema_view(
    openapi.Info(title="Remote Team Manager API", default_version='v1'),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', health_check, name='health'),
    path('api/accounts/', include('apps.accounts.urls')),
    path('api/', include('apps.workspaces.urls')),
    path('api/', include('apps.projects.urls')),
    path('api/', include('apps.chat.urls')),
    path('api/', include('apps.hr.urls')),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
]
