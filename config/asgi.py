import os
from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

django_asgi_app = get_asgi_application()

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator
import apps.chat.routing
import apps.chat.call_routing
import apps.notifications.routing
import apps.presence.routing
import apps.projects.routing
import apps.wiki.routing

# Combine WebSocket URL patterns from all apps
websocket_urlpatterns = (
    apps.chat.routing.websocket_urlpatterns +
    apps.chat.call_routing.websocket_urlpatterns +
    apps.notifications.routing.websocket_urlpatterns +
    apps.presence.routing.websocket_urlpatterns +
    apps.projects.routing.websocket_urlpatterns +
    apps.wiki.routing.websocket_urlpatterns
)

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AllowedHostsOriginValidator(
        AuthMiddlewareStack(
            URLRouter(websocket_urlpatterns)
        )
    ),
})
