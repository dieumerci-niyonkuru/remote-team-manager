from rest_framework.routers import DefaultRouter
from .views import FriendRequestViewSet, FileAttachmentViewSet

router = DefaultRouter()
router.register(r'friend-requests', FriendRequestViewSet, basename='friendrequest')
router.register(r'file-attachments', FileAttachmentViewSet, basename='fileattachment')
urlpatterns = router.urls
