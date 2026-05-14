from rest_framework.routers import DefaultRouter
from .views import EmployeeProfileViewSet, JobPostingViewSet, PayrollRecordViewSet

router = DefaultRouter()
router.register(r'employee-profiles', EmployeeProfileViewSet, basename='employeeprofile')
router.register(r'job-postings', JobPostingViewSet, basename='jobposting')
router.register(r'payroll', PayrollRecordViewSet, basename='payroll')
urlpatterns = router.urls
