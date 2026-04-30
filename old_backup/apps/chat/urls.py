from django.urls import path
from . import views

urlpatterns = [
    path('workspaces/<uuid:workspace_pk>/channels/', views.channel_list, name='channel-list'),
    path('channels/<uuid:channel_pk>/messages/', views.message_list, name='message-list'),
    path('messages/<uuid:message_pk>/reactions/', views.add_reaction, name='add-reaction'),
]
