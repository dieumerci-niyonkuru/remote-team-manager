"""
Remote Team Manager
Django Settings
config/settings.py
"""

import os
from pathlib import Path
from decouple import config, Csv
from datetime import timedelta

# ===========================
# Base Directory
# ===========================
BASE_DIR = Path(__file__).resolve().parent.parent


# ===========================
# Security
# ===========================
SECRET_KEY = config('SECRET_KEY', default='django-insecure-fallback-key-2026-xyz-9876')
DEBUG = config('DEBUG', default=False, cast=bool)
# ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1,.railway.app', cast=Csv())
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='.railway.app,localhost,web-production-655e4.up.railway.app', cast=Csv())
# Trusted origins for CSRF (important for Django admin login)
CSRF_TRUSTED_ORIGINS = [
    'https://remote-team-manager-production.up.railway.app',
    'https://steady-madeleine-72cc1c.netlify.app',   # your Netlify frontend
]


# ===========================
# Applications
# ===========================
DJANGO_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

THIRD_PARTY_APPS = [
    # 'channels',
    'rest_framework',
    'drf_spectacular',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'django_filters',
]

LOCAL_APPS = [
    'apps.notifications',
    'apps.users',
    'apps.workspaces',
    'apps.projects',
    'apps.tasks',
    'apps.knowledge',
    'apps.hr',
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS


# ===========================
# Middleware
# ===========================
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',          # Must be as high as possible
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'


# ===========================
# Templates
# ===========================
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


# ===========================
# Database
# ===========================
import dj_database_url

DATABASES = {
    'default': dj_database_url.config(
        default=config('DATABASE_URL', default=''),
        conn_max_age=600,
    )
}


# ===========================
# Custom User Model
# ===========================
AUTH_USER_MODEL = 'users.User'


# ===========================
# Password Validation
# ===========================
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]


# ===========================
# Internationalisation
# ===========================
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True


# ===========================
# Static Files
# ===========================
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# ===========================
# Django REST Framework
# ===========================
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_FILTER_BACKENDS': (
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_RENDERER_CLASSES': (
        'rest_framework.renderers.JSONRenderer',
    ),
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}


# ===========================
# JWT Settings
# ===========================
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(
        minutes=config('ACCESS_TOKEN_LIFETIME_MINUTES', default=60, cast=int)
    ),
    'REFRESH_TOKEN_LIFETIME': timedelta(
        days=config('REFRESH_TOKEN_LIFETIME_DAYS', default=7, cast=int)
    ),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}


# ===========================
# CORS
# ===========================
# Read allowed origins from environment variable, but also include the Netlify frontend
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://steady-madeleine-72cc1c.netlify.app',   # your live frontend
    'https://remote-team-manager-production.up.railway.app',  # allow API itself (optional)
]
# Override with environment variable if provided
env_origins = config('CORS_ALLOWED_ORIGINS', default='', cast=Csv())
if env_origins:
    CORS_ALLOWED_ORIGINS.extend(env_origins)

CORS_ALLOW_CREDENTIALS = True   # if you use cookies/auth headers (not required for JWT but safe)

CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]


# ===========================
# Swagger / API Docs
# ===========================
SPECTACULAR_SETTINGS = {
    'TITLE': 'Remote Team Manager API',
    'DESCRIPTION': 'Full REST API for managing remote teams, workspaces, projects and tasks.',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
}


# ===========================
# Temporary: Auto-create superuser on Railway (remove after first login)
# ===========================
if os.environ.get('CREATE_SUPERUSER') == 'True':
    try:
        from django.contrib.auth import get_user_model
        User = get_user_model()
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser('admin', 'admin@example.com', 'adminpass123')
            print("✅ Superuser 'admin' created")
        else:
            print("ℹ️ Superuser already exists")
    except Exception as e:
        print(f"⚠️ Superuser creation failed: {e}")
# Ensure database configuration uses the DATABASE_URL environment variable
import dj_database_url
import os

DATABASE_URL = os.environ.get('DATABASE_URL')
if DATABASE_URL:
    DATABASES['default'] = dj_database_url.config(default=DATABASE_URL, conn_max_age=600)
else:
    # Fallback for local development (Docker)
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': 'remoteteam',
            'USER': 'postgres',
            'PASSWORD': 'postgres',
            'HOST': 'db',
            'PORT': 5432,
        }
    }

# Updated CORS for Netlify frontend
CORS_ALLOWED_ORIGINS = [
    "https://remote-team-manager.netlify.app",
    "https://steady-madeleine-72cc1c.netlify.app",
    "http://localhost:5173",
    "http://localhost:3000",
]
CCORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True
# Allow Netlify frontend
CORS_ALLOWED_ORIGINS = [
    "https://remote-team-manager.netlify.app",
    "https://steady-madeleine-72cc1c.netlify.app",
    "http://localhost:5173",
    "http://localhost:3000",
]
CORS_ALLOW_CREDENTIALS = True
# ASGI_APPLICATION = 'config.asgi.application'
# Ensure workspaces app is properly configured
