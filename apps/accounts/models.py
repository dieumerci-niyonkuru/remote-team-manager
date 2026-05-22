from apps.accounts.constants.roles import ROLES
from django.db import models
from django.contrib.auth.models import AbstractUser
from typing import Tuple

class User(AbstractUser):

    ROLE_CHOICES: Tuple[Tuple[str, str], ...] = (
        ('super_admin', 'Super Admin'),
        ('workspace_owner', 'Workspace Owner'),
        ('admin', 'Admin'),
        ('project_manager', 'Project Manager'),
        ('member', 'Member'),
        ('guest', 'Guest'),

        ('developer', 'Developer'),
        ('frontend', 'Frontend'),
        ('backend', 'Backend'),
        ('devops', 'DevOps'),
        ('designer', 'Designer'),
        ('qa', 'QA'),
        ('product', 'Product'),
        ('hr', 'HR'),
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='guest')
