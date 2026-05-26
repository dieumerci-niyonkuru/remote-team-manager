from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ChannelViewSet, DirectMessageViewSet, MessageViewSet

router = DefaultRouter()
router.register(r'channels', ChannelViewSet, basename='channel')
router.register(r'direct-messages', DirectMessageViewSet, basename='directmessage')
router.register(r'messages', MessageViewSet, basename='message')

urlpatterns = [
    path('', include(router.urls)),
]
