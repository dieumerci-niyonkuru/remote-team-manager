from rest_framework.routers import DefaultRouter
from .views import PresenceViewSet

router = DefaultRouter()
router.register(r'presence', PresenceViewSet, basename='presence')
urlpatterns = router.urls
