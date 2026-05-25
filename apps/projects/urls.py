from rest_framework.routers import DefaultRouter
from .views import ProjectViewSet, TaskViewSet, CommentViewSet, SuggestionViewSet, ReactionViewSet, SubtaskViewSet

router = DefaultRouter()
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'subtasks', SubtaskViewSet, basename='subtask')
router.register(r'comments', CommentViewSet, basename='comment')
router.register(r'suggestions', SuggestionViewSet, basename='suggestion')
router.register(r'reactions', ReactionViewSet, basename='reaction')
urlpatterns = router.urls
