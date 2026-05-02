from rest_framework.routers import DefaultRouter
from .views import ChannelViewSet, MessageViewSet, DirectMessageViewSet

router = DefaultRouter()
router.register(r'channels', ChannelViewSet)
router.register(r'messages', MessageViewSet)
router.register(r'direct-messages', DirectMessageViewSet)
urlpatterns = router.urls
