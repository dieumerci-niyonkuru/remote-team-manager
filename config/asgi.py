import os
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django_asgi_app = get_asgi_application()

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from apps.chat.routing import websocket_urlpatterns as chat_urls
from apps.projects.routing import websocket_urlpatterns as project_urls
from apps.notifications.routing import websocket_urlpatterns as notify_urls
from apps.wiki.routing import websocket_urlpatterns as wiki_urls

combined_urlpatterns = chat_urls + project_urls + wiki_urls + notify_urls

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AuthMiddlewareStack(URLRouter(combined_urlpatterns)),
})
