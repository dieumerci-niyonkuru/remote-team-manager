from rest_framework.routers import DefaultRouter
from .views import ChannelViewSet, MessageViewSet, DirectMessageViewSet

router = DefaultRouter()
router.register(r'channels', ChannelViewSet, basename='channel')
router.register(r'messages', MessageViewSet, basename='message')
router.register(r'direct-messages', DirectMessageViewSet, basename='directmessage')
urlpatterns = router.urls
