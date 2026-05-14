from django.db import models
from django.conf import settings
from apps.workspaces.models import Workspace

class Integration(models.Model):
    INTEGRATION_TYPES = (
        ('github', 'GitHub'),
        ('slack', 'Slack'),
        ('notion', 'Notion'),
        ('google_drive', 'Google Drive'),
        ('email', 'Email'),
        ('webhook', 'Custom Webhook'),
    )
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name='integrations')
    type = models.CharField(max_length=50, choices=INTEGRATION_TYPES)
    config = models.JSONField(default=dict)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('workspace', 'type')

    def __str__(self):
        return f"{self.workspace.name} - {self.get_type_display()}"
