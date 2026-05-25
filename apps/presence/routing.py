from django.urls import re_path
from .consumers import PresenceConsumer, WorkspaceConsumer

websocket_urlpatterns = [
    re_path(r'ws/presence/$', PresenceConsumer.as_asgi()),
    re_path(r'ws/workspace/(?P<workspace_id>\d+)/$', WorkspaceConsumer.as_asgi()),
]
