from rest_framework.routers import DefaultRouter
from .views import ChannelViewSet, MessageViewSet, MessageReactionViewSet

router = DefaultRouter()
router.register(r'channels', ChannelViewSet)
router.register(r'messages', MessageViewSet)
router.register(r'reactions', MessageReactionViewSet)
urlpatterns = router.urls
