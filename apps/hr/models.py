import uuid
from django.db import models
from django.conf import settings
from apps.workspaces.models import Workspace


class Department(models.Model):
    id        = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name='departments')
    name      = models.CharField(max_length=100)
    head      = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='headed_departments')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Employee(models.Model):
    class Status(models.TextChoices):
        ACTIVE     = 'active',     'Active'
        ON_LEAVE   = 'on_leave',   'On Leave'
        TERMINATED = 'terminated', 'Terminated'

    class EmploymentType(models.TextChoices):
        FULL_TIME  = 'full_time',  'Full Time'
        PART_TIME  = 'part_time',  'Part Time'
        CONTRACT   = 'contract',   'Contract'
        FREELANCE  = 'freelance',  'Freelance'

    id              = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user            = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='employee_profile')
    workspace       = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name='employees')
    department      = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='employees')
    job_title       = models.CharField(max_length=100)
    employment_type = models.CharField(max_length=20, choices=EmploymentType.choices, default=EmploymentType.FULL_TIME)
    status          = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    hire_date       = models.DateField(null=True, blank=True)
    country         = models.CharField(max_length=100, blank=True, default='')
    timezone        = models.CharField(max_length=50, blank=True, default='UTC')
    salary          = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    currency        = models.CharField(max_length=3, default='USD')
    bio             = models.TextField(blank=True, default='')
    skills          = models.JSONField(default=list, blank=True)
    created_at      = models.DateTimeField(auto_now_add=True)
    updated_at      = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'{self.user.email} — {self.job_title}'


class PayrollRecord(models.Model):
    class Status(models.TextChoices):
        PENDING  = 'pending',  'Pending'
        PAID     = 'paid',     'Paid'
        FAILED   = 'failed',   'Failed'

    id         = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    employee   = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='payroll_records')
    amount     = models.DecimalField(max_digits=12, decimal_places=2)
    currency   = models.CharField(max_length=3, default='USD')
    period     = models.CharField(max_length=20)
    status     = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    notes      = models.TextField(blank=True, default='')
    paid_at    = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.employee} — {self.period}'


class JobPosting(models.Model):
    class Status(models.TextChoices):
        OPEN   = 'open',   'Open'
        CLOSED = 'closed', 'Closed'
        DRAFT  = 'draft',  'Draft'

    id           = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace    = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name='job_postings')
    department   = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='job_postings')
    title        = models.CharField(max_length=150)
    description  = models.TextField()
    requirements = models.TextField(blank=True, default='')
    location     = models.CharField(max_length=100, default='Remote')
    status       = models.CharField(max_length=10, choices=Status.choices, default=Status.OPEN)
    salary_min   = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    salary_max   = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    currency     = models.CharField(max_length=3, default='USD')
    created_by   = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='job_postings')
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class PerformanceReview(models.Model):
    class Rating(models.TextChoices):
        EXCELLENT    = 'excellent',   'Excellent'
        GOOD         = 'good',        'Good'
        SATISFACTORY = 'satisfactory','Satisfactory'
        NEEDS_WORK   = 'needs_work',  'Needs Work'

    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    employee    = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='reviews')
    reviewer    = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='given_reviews')
    period      = models.CharField(max_length=20)
    rating      = models.CharField(max_length=20, choices=Rating.choices)
    goals_met   = models.PositiveIntegerField(default=0)
    goals_total = models.PositiveIntegerField(default=0)
    strengths   = models.TextField(blank=True, default='')
    improvements= models.TextField(blank=True, default='')
    notes       = models.TextField(blank=True, default='')
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'Review: {self.employee} — {self.period}'
