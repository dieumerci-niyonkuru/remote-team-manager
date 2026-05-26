import os
from pathlib import Path
from decouple import config
from datetime import timedelta
import dj_database_url
import sys

# ── Sentry — error monitoring & performance tracking ─────────────────────────
SENTRY_DSN = config('SENTRY_DSN', default='')
if SENTRY_DSN:
    import sentry_sdk
    from sentry_sdk.integrations.django import DjangoIntegration
    from sentry_sdk.integrations.celery import CeleryIntegration
    from sentry_sdk.integrations.redis import RedisIntegration
    sentry_sdk.init(
        dsn=SENTRY_DSN,
        integrations=[DjangoIntegration(), CeleryIntegration(), RedisIntegration()],
        traces_sample_rate=0.1,   # 10% of transactions for performance
        profiles_sample_rate=0.05,
        send_default_pii=False,   # Never send passwords / tokens
        environment=config('SENTRY_ENV', default='production'),
        release=config('RAILWAY_DEPLOYMENT_ID', default='local'),
    )

BASE_DIR = Path(__file__).resolve().parent.parent

# =========================
# CORE SETTINGS
# =========================

SECRET_KEY = config(
    'SECRET_KEY',
    default='django-insecure-9!@#$%^&*()_+abcdefghijklmnopqrstuvwxyz123456'
)

DEBUG = config('DEBUG', default=True, cast=bool)

ALLOWED_HOSTS = config(
    'ALLOWED_HOSTS',
    default='localhost,127.0.0.1,testserver,remote-team-manager-production.up.railway.app'
).split(',')

# Allow all Railway subdomains automatically
ALLOWED_HOSTS += ['.railway.app', '.up.railway.app']
# Remove duplicates
ALLOWED_HOSTS = list(set(h.strip() for h in ALLOWED_HOSTS if h.strip()))

# =========================
# INSTALLED APPS
# =========================

INSTALLED_APPS = [
    # Django core
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # third-party
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'channels',
    'django_celery_results',
    'django_celery_beat',

    # local apps
    'apps.accounts',
    'apps.workspaces',
    'apps.projects',
    'apps.chat',
    'apps.hr',
    'apps.notifications',
    'apps.presence',
    'apps.communications',
    'apps.okr',
    'apps.ai',
    'apps.automation',
    'apps.wiki',
    'apps.integrations',
    'apps.timetracking',
    'apps.feedback',
]

# =========================
# MIDDLEWARE
# =========================

MIDDLEWARE = [
    'apps.auth.rate_limit.RateLimitMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'apps.auth.security_headers.SecurityHeadersMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',

    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',

    'apps.auth.middleware.RoleMiddleware',

    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

# =========================
# TEMPLATES
# =========================

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'
ASGI_APPLICATION = 'config.asgi.application'

# =========================
# DATABASE
# =========================

DATABASE_URL = config('DATABASE_URL', default=None)

if DATABASE_URL:
    DATABASES = {
        'default': dj_database_url.parse(DATABASE_URL)
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

# =========================
# AUTH
# =========================

AUTH_USER_MODEL = 'accounts.User'

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# =========================
# CUSTOM AUTHENTICATION BACKEND (allow login with email or username)
# =========================

AUTHENTICATION_BACKENDS = [
    'apps.accounts.backends.EmailOrUsernameBackend',
    'django.contrib.auth.backends.ModelBackend',
]

# =========================
# INTERNATIONALIZATION
# =========================

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# =========================
# STATIC / MEDIA
# =========================

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# =========================
# DRF CONFIG
# =========================

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.AllowAny',
    ),
    'DEFAULT_RENDERER_CLASSES': (
        'rest_framework.renderers.JSONRenderer',
    ) if ('pytest' in sys.modules or (len(sys.argv) > 1 and sys.argv[1] == 'test')) else (
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',
    ),
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle'
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/day',
        'user': '1000/day'
    }
}

# =========================
# JWT
# =========================

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
}

# =========================
# CORS
# =========================

CORS_ALLOWED_ORIGINS = [
    origin.strip()
    for origin in config(
        'CORS_ALLOWED_ORIGINS',
        default='http://localhost:3000,http://localhost:5173,http://localhost:5174'
    ).split(',')
]

CORS_ALLOW_CREDENTIALS = True

# Also trust Railway HTTPS origins for CSRF
CSRF_TRUSTED_ORIGINS = config(
    'CSRF_TRUSTED_ORIGINS',
    default='https://*.railway.app,https://*.up.railway.app'
).split(',')

# =========================
# CHANNEL LAYERS (FIXED)
# =========================

REDIS_URL = config('REDIS_URL', default=None) or config('REDISCLOUD_URL', default=None)

if REDIS_URL:
    CHANNEL_LAYERS = {
        "default": {
            "BACKEND": "channels_redis.core.RedisChannelLayer",
            "CONFIG": {
                "hosts": [REDIS_URL],
            },
        },
    }
else:
    # Fallback to in-memory channel layer (single-process only; WebSockets limited to 1 replica)
    CHANNEL_LAYERS = {
        "default": {
            "BACKEND": "channels.layers.InMemoryChannelLayer",
        },
    }

# Cache: use Redis if available, else in-memory
if REDIS_URL:
    CACHES = {
        "default": {
            "BACKEND": "django.core.cache.backends.redis.RedisCache",
            "LOCATION": REDIS_URL,
        }
    }
else:
    CACHES = {
        "default": {
            "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        }
    }

# =========================
# DEFAULT AUTO FIELD
# =========================

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
# ============================================================
# PRODUCTION SECURITY HARDENING
# ============================================================

# ============================================================
# PRODUCTION SECURITY HARDENING
# ============================================================

# Railway terminates SSL at its edge proxy — never redirect internally
# (the app always sees HTTP from Railway's proxy, not HTTPS directly)
SECURE_SSL_REDIRECT = False
# Trust Railway's forwarded proto header so Django knows the request arrived over HTTPS
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

SESSION_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SECURE = not DEBUG

# HSTS — only enable in production
SECURE_HSTS_SECONDS = 31536000 if not DEBUG else 0
SECURE_HSTS_INCLUDE_SUBDOMAINS = not DEBUG
SECURE_HSTS_PRELOAD = not DEBUG

# Browser security headers (production-only)
if not DEBUG:
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = 'DENY'

SECURE_REFERRER_POLICY = 'strict-origin-when-cross-origin'

# Permissions-Policy
SECURE_CROSS_ORIGIN_OPENER_POLICY = 'same-origin'

# Static files
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# File upload security
FILE_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024  # 10 MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024  # 10 MB
ALLOWED_UPLOAD_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.doc', '.docx', '.xls', '.xlsx']

# Logging — structured JSON-style logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'json': {
            '()': 'django.utils.log.ServerFormatter',
            'format': '[%(asctime)s] %(levelname)s %(name)s %(message)s',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'json',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {'handlers': ['console'], 'level': 'WARNING', 'propagate': False},
        'apps': {'handlers': ['console'], 'level': 'INFO', 'propagate': False},
    },
}

# Frontend and Email settings
FRONTEND_URL = config('FRONTEND_URL', default='http://localhost:5173')
DEFAULT_FROM_EMAIL = config('EMAIL_HOST_USER', default='noreply@remoteteam.app')

# =========================
# EMAIL (SMTP)
# =========================
EMAIL_BACKEND = config('EMAIL_BACKEND', default='django.core.mail.backends.console.EmailBackend')
EMAIL_HOST = config('EMAIL_HOST', default='smtp.gmail.com')
EMAIL_PORT = config('EMAIL_PORT', default=587, cast=int)
EMAIL_USE_TLS = config('EMAIL_USE_TLS', default=True, cast=bool)
EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='')

# =========================
# CELERY
# =========================
_celery_redis = REDIS_URL or 'redis://localhost:6379/0'
CELERY_BROKER_URL = _celery_redis
CELERY_RESULT_BACKEND = _celery_redis
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = TIME_ZONE
CELERY_TASK_TRACK_STARTED = True
CELERY_TASK_TIME_LIMIT = 30 * 60  # 30 minutes
CELERY_WORKER_PREFETCH_MULTIPLIER = 1
CELERY_ACKS_LATE = True

# Celery Beat — periodic tasks
from celery.schedules import crontab
CELERY_BEAT_SCHEDULE = {
    'daily-digest': {
        'task': 'apps.notifications.tasks.send_daily_digest',
        'schedule': crontab(hour=8, minute=0),  # 8 AM every day
    },
}

# Email
DEFAULT_FROM_EMAIL = config('DEFAULT_FROM_EMAIL', default='noreply@remoteteam.app')
