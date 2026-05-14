from django.urls import path
from . import views

urlpatterns = [
    path('workspaces/<uuid:workspace_pk>/jobs/', views.job_list, name='job-list'),
]
