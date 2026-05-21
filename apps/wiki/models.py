from django.db import models
from django.conf import settings
from apps.workspaces.models import Workspace

class WikiArticle(models.Model):
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name='wiki_articles')
    title = models.CharField(max_length=200)
    content = models.TextField()
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    category = models.CharField(max_length=100, blank=True)
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL, related_name='children')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class WikiRevision(models.Model):
    article = models.ForeignKey(WikiArticle, on_delete=models.CASCADE, related_name='revisions')
    content = models.TextField()
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Revision {self.id} of {self.article.title}"
