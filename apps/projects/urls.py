from rest_framework.routers import DefaultRouter
from .views import ProjectViewSet, TaskViewSet, ReactionViewSet

router = DefaultRouter()
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'reactions', ReactionViewSet, basename='reaction')
urlpatterns = router.urls
