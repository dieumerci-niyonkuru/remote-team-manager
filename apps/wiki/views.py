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

    @action(detail=True, methods=['get'], url_path='revisions')
    def revisions(self, request, pk=None):
        article = self.get_object()
        revisions = WikiRevision.objects.filter(article=article).order_by('-created_at')
        serializer = WikiRevisionSerializer(revisions, many=True)
        return Response({'data': serializer.data})

    @action(detail=True, methods=['post'], url_path=r'revisions/(?P<revision_id>\d+)/restore')
    def restore_revision(self, request, pk=None, revision_id=None):
        article = self.get_object()
        try:
            rev = WikiRevision.objects.get(id=revision_id, article=article)
        except WikiRevision.DoesNotExist:
            return Response({'error': 'Revision not found'}, status=status.HTTP_404_NOT_FOUND)
        article.content = rev.content
        article.save()
        WikiRevision.objects.create(article=article, content=rev.content, author=request.user)
        return Response(WikiArticleSerializer(article).data, status=status.HTTP_200_OK)
