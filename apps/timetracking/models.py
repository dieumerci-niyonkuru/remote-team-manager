from django.db import models
from django.conf import settings
from apps.projects.models import Task

class TimeLog(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='time_logs')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(null=True, blank=True)
    duration = models.PositiveIntegerField(default=0)
    is_running = models.BooleanField(default=False)
