from typing import Tuple
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES: Tuple[Tuple[str, str], ...] = (
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
    
    # Profile visibility choices
    VISIBILITY_CHOICES: Tuple[Tuple[str, str], ...] = [
        ('public', 'Public'), 
        ('workspace', 'Workspace only'), 
        ('private', 'Private')
    ]
    profile_visibility = models.CharField(
        max_length=20,
        choices=VISIBILITY_CHOICES,
        default='workspace'
    )

    otp_secret = models.CharField(max_length=16, blank=True, null=True)
    otp_enabled = models.BooleanField(default=False)

    def __str__(self) -> str:
        return str(self.email) if self.email else str(self.username)
