import uuid
from django.db import models
from django.conf import settings
from apps.workspaces.models import Workspace


class KnowledgePage(models.Model):
    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace   = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name='knowledge_pages')
    title       = models.CharField(max_length=200)
    content     = models.TextField(blank=True, default='')
    emoji       = models.CharField(max_length=10, default='📄')
    parent      = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='children')
    created_by  = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='knowledge_pages')
    updated_by  = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='updated_pages')
    is_pinned   = models.BooleanField(default=False)
    views       = models.PositiveIntegerField(default=0)
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return self.title


class FileAttachment(models.Model):
    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace   = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name='files')
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='files')
    name        = models.CharField(max_length=200)
    file_type   = models.CharField(max_length=50, blank=True)
    file_size   = models.PositiveIntegerField(default=0)
    url         = models.URLField(blank=True, default='')
    object_type = models.CharField(max_length=50, blank=True)
    object_id   = models.UUIDField(null=True, blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name
