from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ChannelViewSet, DirectMessageViewSet, MessageViewSet, CallRoomViewSet

router = DefaultRouter()
router.register(r'channels', ChannelViewSet, basename='channel')
router.register(r'direct-messages', DirectMessageViewSet, basename='directmessage')
router.register(r'messages', MessageViewSet, basename='message')
router.register(r'calls', CallRoomViewSet, basename='call')

urlpatterns = [
    path('', include(router.urls)),
]
