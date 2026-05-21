from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers
from .views import WikiArticleViewSet, WikiRevisionViewSet

router = DefaultRouter()
router.register(r'articles', WikiArticleViewSet, basename='wikiarticle')

# Nested router for revisions under each article
articles_router = routers.NestedDefaultRouter(router, r'articles', lookup='article')
articles_router.register(r'revisions', WikiRevisionViewSet, basename='wikirevision')

urlpatterns = router.urls + articles_router.urls
