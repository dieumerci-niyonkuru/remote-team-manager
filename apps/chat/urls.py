from rest_framework.routers import DefaultRouter
from .views import ChatRoomViewSet, ChatMessageViewSet

router = DefaultRouter()
router.register(r'rooms', ChatRoomViewSet, basename='chatroom')
router.register(r'messages', ChatMessageViewSet, basename='chatmessage')
urlpatterns = router.urls
