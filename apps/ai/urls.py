from django.urls import path
from .views import AISuggestTasksView, AITaskSummaryView, AIWritingAssistantView, AIWorkspaceInsightsView

urlpatterns = [
    path('', AISuggestTasksView.as_view(), name='ai-suggest'),
    path('summary/', AITaskSummaryView.as_view(), name='ai-summary'),
    path('write/', AIWritingAssistantView.as_view(), name='ai-write'),
    path('insights/', AIWorkspaceInsightsView.as_view(), name='ai-insights'),
]
