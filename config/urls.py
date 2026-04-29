from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.utils import timezone
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
import apps.tasks.views as task_views


def health_check(request):
    return JsonResponse({
        'status': 'ok',
        'message': 'Remote Team Manager is running',
        'timestamp': timezone.now().isoformat(),
        'version': '1.0.0',
    })


urlpatterns = [
    path('api/hr/', include('apps.hr.urls')),
    path('api/chat/', include('apps.chat.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    path('admin/', admin.site.urls),
    path('api/health/', health_check, name='health-check'),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/auth/', include('apps.users.urls')),
    path('api/workspaces/', include('apps.workspaces.urls')),
    path('api/workspaces/<uuid:workspace_pk>/projects/', include('apps.projects.urls')),
    path('api/workspaces/<uuid:workspace_pk>/projects/<uuid:project_pk>/tasks/', include('apps.tasks.urls')),
    path('api/workspaces/<uuid:workspace_pk>/activity/', task_views.activity_feed, name='activity-feed'),
]
from apps.ai.views import suggest_task
from apps.integrations.views import slack_webhook
urlpatterns += [
    path('api/ai/suggest/', suggest_task, name='ai-suggest'),
    path('api/integrations/slack/', slack_webhook, name='slack-webhook'),
]
