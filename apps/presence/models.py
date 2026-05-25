from django.db import models
from django.conf import settings
from django.utils.timezone import now


class Presence(models.Model):
    STATUS_CHOICES = (
        ('online', 'Online'),
        ('away', 'Away'),
        ('busy', 'Busy'),
        ('dnd', 'Do Not Disturb'),
        ('offline', 'Offline'),
    )

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='presence',
    )
    last_activity = models.DateTimeField(default=now)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='offline')
    custom_status = models.CharField(max_length=100, blank=True, default='')
    status_emoji = models.CharField(max_length=10, blank=True, default='')

    def is_online(self):
        from datetime import timedelta
        return (now() - self.last_activity) < timedelta(seconds=300)

    def effective_status(self):
        if self.status == 'dnd':
            return 'dnd'
        if not self.is_online():
            return 'offline'
        return self.status

    def __str__(self):
        return f"{self.user.username} — {self.effective_status()}"
