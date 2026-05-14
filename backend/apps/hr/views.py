from rest_framework import viewsets, permissions
from .models import EmployeeProfile, JobPosting, PayrollRecord
from .serializers import EmployeeProfileSerializer, JobPostingSerializer, PayrollRecordSerializer

class EmployeeProfileViewSet(viewsets.ModelViewSet):
    serializer_class = EmployeeProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return EmployeeProfile.objects.filter(workspace__members=self.request.user)

class JobPostingViewSet(viewsets.ModelViewSet):
    serializer_class = JobPostingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return JobPosting.objects.filter(workspace__members=self.request.user)

    def perform_create(self, serializer):
        serializer.save(posted_by=self.request.user)

class PayrollRecordViewSet(viewsets.ModelViewSet):
    serializer_class = PayrollRecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PayrollRecord.objects.filter(employee__workspace__members=self.request.user)
