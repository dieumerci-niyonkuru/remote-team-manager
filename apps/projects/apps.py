from django.apps import AppConfig

class ProjectsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.projects'

    def ready(self):
        # No signals imported here – they were causing ImportError
        pass
