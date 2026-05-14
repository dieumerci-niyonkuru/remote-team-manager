from django.urls import path
from .views import notification_list, unread_count, mark_read

urlpatterns = [
    path('', notification_list, name='notification-list'),
    path('unread-count/', unread_count, name='unread-count'),
    path('<uuid:pk>/read/', mark_read, name='mark-read'),
]
