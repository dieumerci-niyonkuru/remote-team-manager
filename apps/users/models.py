from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    """Custom User model for Remote Team Manager"""
    pass

    def __str__(self):
        return self.email or self.username

