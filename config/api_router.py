from django.urls import path, include

urlpatterns = [
    # Chat
    path('chat/', include('apps.chat.urls')),
    # Workspaces, Projects, Subtasks
    path('', include('apps.workspaces.urls')),
    path('', include('apps.projects.urls')),
    # Notifications & Invites
    path('', include('apps.notifications.urls')),
    # HR (employee profiles, jobs, payroll)
    path('', include('apps.hr.urls')),
    # Time Tracking
    path('timelogs/', include('apps.timetracking.urls')),
    # Wiki articles + revisions
    path('wiki-', include('apps.wiki.urls')),
    # Automation rules
    path('automation-', include('apps.automation.urls')),
    # OKR (objectives, key results)
    path('', include('apps.okr.urls')),
    # Presence
    path('', include('apps.presence.urls')),
    # Integrations
    path('', include('apps.integrations.urls')),
    # Feedback
    path('', include('apps.feedback.urls')),
]
