from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from .models import WikiArticle, WikiRevision
from .serializers import WikiArticleSerializer, WikiRevisionSerializer
from .permissions import IsEditorOrOwner

class WikiArticleViewSet(viewsets.ModelViewSet):
    serializer_class = WikiArticleSerializer
    permission_classes = [permissions.IsAuthenticated, IsEditorOrOwner]

    def get_queryset(self):
        qs = WikiArticle.objects.filter(workspace__members=self.request.user)
        q = self.request.query_params.get('q')
        if q:
            qs = qs.filter(title__icontains=q) | qs.filter(content__icontains=q)
        return qs.order_by('-updated_at')

class WikiRevisionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = WikiRevisionSerializer
    permission_classes = [permissions.IsAuthenticated, IsEditorOrOwner]

    def get_queryset(self):
        article_id = self.kwargs.get('article_pk')
        return WikiRevision.objects.filter(article_id=article_id)

    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None, article_pk=None):
        """Restore the article to this revision's content."""
        rev = self.get_object()
        article = rev.article
        article.content = rev.content
        article.save()
        # Optionally create a new revision reflecting the restore
        WikiRevision.objects.create(article=article, content=rev.content, author=request.user)
        return Response(WikiArticleSerializer(article).data, status=status.HTTP_200_OK)

