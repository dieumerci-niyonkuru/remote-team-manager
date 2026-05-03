from rest_framework.routers import DefaultRouter
from .views import WikiArticleViewSet

router = DefaultRouter()
router.register(r'articles', WikiArticleViewSet, basename='wikiarticle')
urlpatterns = router.urls
