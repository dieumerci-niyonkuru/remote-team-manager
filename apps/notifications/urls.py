from django.urls import path
from . import views

urlpatterns = [
    path('', views.notification_list, name='notification-list'),
    path('unread-count/', views.unread_count, name='unread-count'),
    path('<uuid:pk>/read/', views.mark_read, name='mark-read'),
]
