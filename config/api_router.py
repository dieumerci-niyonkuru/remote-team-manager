from django.urls import path, include

urlpatterns = [
    path('chat/', include('apps.chat.urls')),
    path('', include('apps.workspaces.urls')),
    path('', include('apps.projects.urls')),
]
