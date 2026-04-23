from django.contrib import admin
from django.urls import path
from django.http import HttpResponse, JsonResponse

def api_root(request):
    return HttpResponse(
        '<h1>Remote Team Manager API</h1>'
        '<p>Welcome to the Remote Team Manager backend.</p>'
        '<ul>'
        '<li><a href="/admin/">Admin Panel</a></li>'
        '<li><a href="/api/health/">Health Check</a></li>'
        '</ul>'
        '<p>For API endpoints, use <code>/api/workspaces/</code>, <code>/api/projects/</code>, <code>/api/tasks/</code> (coming soon).</p>',
        content_type='text/html'
    )

def health_check(request):
    return JsonResponse({"status": "ok", "message": "Remote Team Manager is running"})

urlpatterns = [
    path('', api_root),               # ← now root shows info page
    path('admin/', admin.site.urls),
    path('api/health/', health_check),
]
