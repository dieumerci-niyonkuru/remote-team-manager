import uuid
from django.db import models
from django.conf import settings
from apps.workspaces.models import Workspace


class Project(models.Model):
    class Status(models.TextChoices):
        ACTIVE    = 'active',    'Active'
        ON_HOLD   = 'on_hold',   'On Hold'
        COMPLETED = 'completed', 'Completed'
        ARCHIVED  = 'archived',  'Archived'

    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace   = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name='projects')
    name        = models.CharField(max_length=150)
    description = models.TextField(blank=True, default='')
    status      = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    created_by  = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='created_projects')
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.name} ({self.workspace.name})'
