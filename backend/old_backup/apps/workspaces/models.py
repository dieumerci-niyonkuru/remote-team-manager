import uuid
from django.db import models
from django.conf import settings


class Workspace(models.Model):
    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name        = models.CharField(max_length=100)
    description = models.TextField(blank=True, default='')
    owner       = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='owned_workspaces')
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class WorkspaceMember(models.Model):
    class Role(models.TextChoices):
        OWNER     = 'owner',     'Owner'
        MANAGER   = 'manager',   'Manager'
        DEVELOPER = 'developer', 'Developer'
        VIEWER    = 'viewer',    'Viewer'

    workspace  = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name='members')
    user       = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='workspace_memberships')
    role       = models.CharField(max_length=20, choices=Role.choices, default=Role.VIEWER)
    joined_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['workspace', 'user']
        ordering        = ['joined_at']

    def __str__(self):
        return f'{self.user.email} — {self.role} in {self.workspace.name}'
