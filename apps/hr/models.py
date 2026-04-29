import uuid
from django.db import models
from django.conf import settings
from apps.workspaces.models import Workspace

class JobPosting(models.Model):
    class Status(models.TextChoices):
        OPEN = 'open', 'Open'
        CLOSED = 'closed', 'Closed'
        DRAFT = 'draft', 'Draft'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name='job_postings')
    title = models.CharField(max_length=150)
    description = models.TextField()
    requirements = models.TextField(blank=True, default='')
    location = models.CharField(max_length=100, default='Remote')
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.OPEN)
    salary_min = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    salary_max = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    currency = models.CharField(max_length=3, default='USD')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='job_postings')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
