from django.urls import path
from .views import SuggestTasksView

urlpatterns = [
    path('suggest-tasks/', SuggestTasksView.as_view(), name='ai_suggest_tasks'),
]
