from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.http import FileResponse, HttpResponse, JsonResponse
from apps.workspaces.views import GlobalSearchView
from apps.auth.health import HealthCheckView
from apps.health.urls import health as health_check
import os


# ── JSON error handlers ───────────────────────────────────────────────────────
# Override Django's default HTML 400/404/500 handlers so that ANY unhandled
# exception returns machine-readable JSON instead of an HTML error page.
# The custom DRF EXCEPTION_HANDLER covers API views; these cover anything that
# escapes DRF (e.g. middleware errors, URL-resolution failures).

def _json_400(request, exception=None, *args, **kwargs):
    return JsonResponse({"detail": "Bad request."}, status=400)

def _json_403(request, exception=None, *args, **kwargs):
    return JsonResponse({"detail": "Forbidden."}, status=403)

def _json_404(request, exception=None, *args, **kwargs):
    return JsonResponse({"detail": "Not found."}, status=404)

def _json_500(request, *args, **kwargs):
    return JsonResponse({"detail": "Internal server error. Please try again."}, status=500)

handler400 = _json_400
handler403 = _json_403
handler404 = _json_404
handler500 = _json_500


def serve_spa(request, path=''):
    """
    Catch-all view: returns the compiled React index.html for every URL that
    is not an API / admin / static / media route.

    WhiteNoise handles assets that physically exist in dist/ (JS, CSS, images).
    This view handles React Router paths like /dashboard, /login, /projects …
    that do NOT correspond to a real file — the browser gets index.html and
    React Router takes it from there.
    """
    dist_index = os.path.join(settings.BASE_DIR, 'dist', 'index.html')
    if os.path.exists(dist_index):
        return FileResponse(open(dist_index, 'rb'), content_type='text/html')
    # Fallback when the frontend hasn't been built yet (dev without dist/)
    return HttpResponse(
        '<html><body>'
        '<h2>Frontend not built</h2>'
        '<p>Run <code>npm run build</code> to generate the React app, '
        'or start the Vite dev server separately on port 5174.</p>'
        '</body></html>',
        status=200,
        content_type='text/html',
    )


urlpatterns = [
    path('admin/', admin.site.urls),

    # ── Health checks ────────────────────────────────────────────────────────
    # Lightweight DB + Redis probe — Railway uses this for healthcheck
    path('api/health/', health_check, name='health'),
    # Extended: also reports pending migrations and cache status
    path('api/health/extended/', HealthCheckView.as_view(), name='health-extended'),

    # ── Auth ─────────────────────────────────────────────────────────────────
    path('api/auth/', include('apps.accounts.urls')),

    # ── AI suggestions (canonical URL used by frontend) ───────────────────────
    path('api/ai-suggestions/', include('apps.ai.urls')),

    # ── Global search ─────────────────────────────────────────────────────────
    path('api/search/', GlobalSearchView.as_view(), name='global-search'),

    # ── All other API routes via the router ───────────────────────────────────
    path('api/', include('config.api_router')),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) + [

    # ── React SPA catch-all ───────────────────────────────────────────────────
    # MUST be last — matches every path not already handled above.
    # WhiteNoise intercepts real static files (dist/assets/…) before this view
    # is ever reached, so this only fires for React Router client-side routes.
    re_path(r'^(?P<path>.*)$', serve_spa, name='spa'),
]
