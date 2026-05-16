from django.db import models
from django.conf import settings
from apps.workspaces.models import Workspace



class FriendRequest(models.Model):
    from_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_requests')
    to_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='received_requests')
    status = models.CharField(max_length=20, default='pending')  # pending, accepted, rejected
    created_at = models.DateTimeField(auto_now_add=True)

class FileAttachment(models.Model):
    content_type = models.CharField(max_length=50)  # 'task', 'project', 'workspace', 'dm'
    object_id = models.PositiveIntegerField()
    file = models.FileField(upload_to='attachments/')
    filename = models.CharField(max_length=255, blank=True)
    file_size = models.PositiveIntegerField(default=0)
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    version = models.IntegerField(default=1)
