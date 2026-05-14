import os
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django_asgi_app = get_asgi_application()

from channels.routing import ProtocolTypeRouter, URLRouter
from apps.accounts.middleware import JwtAuthMiddleware
from apps.chat.routing import websocket_urlpatterns as chat_patterns
from apps.notifications.routing import websocket_urlpatterns as notif_patterns
from apps.projects.routing import websocket_urlpatterns as project_patterns

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": JwtAuthMiddleware(URLRouter(chat_patterns + notif_patterns + project_patterns)),
})
