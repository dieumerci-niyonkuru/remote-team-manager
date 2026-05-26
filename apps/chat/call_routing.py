from django.urls import re_path
from .signaling import CallSignalingConsumer

websocket_urlpatterns = [
    re_path(r'ws/call/(?P<room_id>[\w-]+)/$', CallSignalingConsumer.as_asgi()),
]
