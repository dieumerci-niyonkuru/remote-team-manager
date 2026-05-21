from django.urls import re_path
from .consumers import WikiCollabConsumer

# WebSocket URL patterns for Wiki collaboration
# URL: ws/wiki/<article_id>/
websocket_urlpatterns = [
    re_path(r'ws/wiki/(?P<article_id>\d+)/$', WikiCollabConsumer.as_asgi()),
]
