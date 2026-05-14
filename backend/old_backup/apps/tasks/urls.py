from django.urls import path
from . import views

urlpatterns = [
    path('', views.task_list, name='task-list'),
    path('<uuid:pk>/', views.task_detail, name='task-detail'),
    path('<uuid:task_pk>/subtasks/', views.subtask_list, name='subtask-list'),
    path('<uuid:task_pk>/subtasks/<uuid:pk>/', views.subtask_detail, name='subtask-detail'),
    path('<uuid:task_pk>/timelogs/', views.timelog_list, name='timelog-list'),
]
