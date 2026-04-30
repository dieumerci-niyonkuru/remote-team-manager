from rest_framework.routers import DefaultRouter
from .views import EmployeeProfileViewSet, JobPostingViewSet, PayrollRecordViewSet

router = DefaultRouter()
router.register(r'employee-profiles', EmployeeProfileViewSet)
router.register(r'job-postings', JobPostingViewSet)
router.register(r'payroll', PayrollRecordViewSet)
urlpatterns = router.urls
