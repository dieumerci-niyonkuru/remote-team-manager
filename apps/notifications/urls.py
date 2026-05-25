from rest_framework.routers import DefaultRouter
from .views import NotificationViewSet, InviteViewSet

router = DefaultRouter()
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'invites', InviteViewSet, basename='invite')
urlpatterns = router.urls
