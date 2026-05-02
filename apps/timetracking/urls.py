from django.urls import path
from .views import StartTimerView, PauseTimerView

urlpatterns = [
    path('start/', StartTimerView.as_view(), name='start_timer'),
    path('pause/', PauseTimerView.as_view(), name='pause_timer'),
]
