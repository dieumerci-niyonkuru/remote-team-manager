from django.urls import path
from .views import ChatRoomListCreateView, MessageListCreateView

urlpatterns = [
    path('rooms/', ChatRoomListCreateView.as_view()),
    path('messages/', MessageListCreateView.as_view()),
]
