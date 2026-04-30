from rest_framework import serializers
from .models import EmployeeProfile, JobPosting, PayrollRecord
from apps.accounts.serializers import UserSerializer

class EmployeeProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = EmployeeProfile
        fields = ('id', 'user', 'workspace', 'employee_id', 'department', 'position', 'salary', 'hire_date', 'phone', 'address')

class JobPostingSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobPosting
        fields = ('id', 'workspace', 'title', 'description', 'requirements', 'location', 'salary_min', 'salary_max', 'posted_by', 'posted_at', 'deadline', 'is_active')

class PayrollRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = PayrollRecord
        fields = ('id', 'employee', 'month', 'gross_salary', 'deductions', 'net_salary', 'paid', 'paid_date')
