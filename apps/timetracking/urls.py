from django.urls import path
from .views import StartTimerView, PauseTimerView, TaskTimeLogsView

urlpatterns = [
    path('start/', StartTimerView.as_view(), name='start_timer'),
    path('pause/', PauseTimerView.as_view(), name='pause_timer'),
    path('logs/', TaskTimeLogsView.as_view(), name='time_logs'),
]
