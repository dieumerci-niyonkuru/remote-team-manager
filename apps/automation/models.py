from django.db import models
from django.conf import settings
from apps.workspaces.models import Workspace

class AutomationRule(models.Model):
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name='automations')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    trigger = models.CharField(max_length=100) # e.g. "task_done", "task_created"
    action = models.CharField(max_length=100)  # e.g. "notify_manager", "assign_member"
    action_data = models.JSONField(default=dict) # any config needed for the action
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
