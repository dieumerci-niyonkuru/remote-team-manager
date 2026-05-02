from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ('viewer', 'Viewer'),
        ('developer', 'Developer'),
        ('manager', 'Manager'),
        ('owner', 'Owner'),
        ('frontend', 'Frontend'),
        ('backend', 'Backend'),
        ('devops', 'DevOps'),
        ('designer', 'Designer'),
        ('qa', 'QA'),
        ('product', 'Product'),
        ('hr', 'HR'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='viewer')
    bio = models.TextField(blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    # New field: profile visibility (who can see your avatar & bio)
    profile_visibility = models.CharField(
        max_length=20,
        choices=[('public', 'Public'), ('workspace', 'Workspace only'), ('private', 'Private')],
        default='workspace'
    )

    def __str__(self):
        return self.email

    # Two-factor authentication fields
    otp_secret = models.CharField(max_length=16, blank=True, null=True)
    otp_enabled = models.BooleanField(default=False)
