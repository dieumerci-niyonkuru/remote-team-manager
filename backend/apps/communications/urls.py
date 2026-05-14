from rest_framework.routers import DefaultRouter
from .views import DirectMessageViewSet, FriendRequestViewSet, FileAttachmentViewSet

router = DefaultRouter()
router.register(r'direct-messages', DirectMessageViewSet)
router.register(r'friend-requests', FriendRequestViewSet)
router.register(r'file-attachments', FileAttachmentViewSet)
urlpatterns = router.urls
