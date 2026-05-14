from django.db import models
from django.conf import settings
from apps.workspaces.models import Workspace

class Objective(models.Model):
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name='objectives')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class KeyResult(models.Model):
    objective = models.ForeignKey(Objective, on_delete=models.CASCADE, related_name='key_results')
    title = models.CharField(max_length=255)
    target_value = models.FloatField(default=100)
    current_value = models.FloatField(default=0)
    unit = models.CharField(max_length=50, default='%')
