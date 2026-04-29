from rest_framework import serializers
from .models import JobPosting

class JobPostingSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobPosting
        fields = ['id', 'title', 'description', 'requirements', 'location', 'status', 'salary_min', 'salary_max', 'currency', 'created_at']
        read_only_fields = ['id', 'created_at']
