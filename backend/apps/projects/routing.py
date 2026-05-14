from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/tasks/(?P<workspace_id>\w+)/$', consumers.TaskConsumer.as_view()),
]
