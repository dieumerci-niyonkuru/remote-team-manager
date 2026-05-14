from rest_framework import viewsets, permissions
from .models import WikiArticle
from .serializers import WikiArticleSerializer

class WikiArticleViewSet(viewsets.ModelViewSet):
    serializer_class = WikiArticleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = WikiArticle.objects.filter(workspace__members=self.request.user)
        q = self.request.query_params.get('q')
        if q:
            qs = qs.filter(title__icontains=q) | qs.filter(content__icontains=q)
        return qs.order_by('-updated_at')

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
