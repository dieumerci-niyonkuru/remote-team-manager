from rest_framework.routers import DefaultRouter
from .views import ProjectViewSet, TaskViewSet, ReactionViewSet

router = DefaultRouter()
router.register(r'projects', ProjectViewSet)
router.register(r'tasks', TaskViewSet)
router.register(r'reactions', ReactionViewSet)
urlpatterns = router.urls
