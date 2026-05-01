from django.db import models
from django.conf import settings
from django.utils.timezone import now

class Presence(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='presence')
    last_activity = models.DateTimeField(default=now)
    status = models.CharField(max_length=20, default='offline')  # online, offline, away

    def is_online(self):
        from django.utils.timezone import timedelta
        return (now() - self.last_activity).seconds < 300  # 5 minutes threshold
