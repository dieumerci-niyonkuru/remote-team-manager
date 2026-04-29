# Add these lines to your config/settings.py – manually or via sed
ALLOWED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0', 'remote-team-manager-production.up.railway.app']
CORS_ALLOWED_ORIGINS = ['https://remote-team-manager.netlify.app', 'http://localhost:5173']
CORS_ALLOW_CREDENTIALS = True
