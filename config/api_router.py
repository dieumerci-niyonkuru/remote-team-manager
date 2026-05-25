from django.urls import path, include

urlpatterns = [
    # Chat: channels, direct-messages, messages (also legacy /rooms/)
    path('', include('apps.chat.urls')),
    # Workspaces, Projects, Subtasks
    path('', include('apps.workspaces.urls')),
    path('', include('apps.projects.urls')),
    # Notifications & Invites
    path('', include('apps.notifications.urls')),
    # HR (employee profiles, jobs, payroll)
    path('', include('apps.hr.urls')),
    # Time Tracking  — /api/timelogs/start|pause|logs/
    path('timelogs/', include('apps.timetracking.urls')),
    # Wiki articles + revisions — /api/wiki-articles/
    path('wiki-', include('apps.wiki.urls')),
    # Automation rules — /api/automation-rules/
    path('automation-', include('apps.automation.urls')),
    # OKR (objectives, key results)
    path('', include('apps.okr.urls')),
    # Presence
    path('', include('apps.presence.urls')),
    # Integrations
    path('', include('apps.integrations.urls')),
    # Feedback
    path('', include('apps.feedback.urls')),
    # File attachments & friend requests
    path('', include('apps.communications.urls')),
]
