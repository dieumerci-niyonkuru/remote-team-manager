from rest_framework.routers import DefaultRouter
from .views import ChannelViewSet, MessageViewSet, MessageReactionViewSet

router = DefaultRouter()
router.register(r'channels', ChannelViewSet, basename='channel')
router.register(r'messages', MessageViewSet, basename='message')
router.register(r'reactions', MessageReactionViewSet, basename='chat-reaction')
urlpatterns = router.urls
