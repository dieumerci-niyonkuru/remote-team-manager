# =============================================================================
# RemoteTeam Manager — Development Dockerfile
# Used by docker-compose.yml for the backend service.
# For production use Dockerfile.prod (multi-stage, builds React frontend too).
# =============================================================================

FROM python:3.11-slim

WORKDIR /app

# System deps: libpq for psycopg2, gcc for wheel compilation
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Python dependencies — cached layer, only rebuilt when requirements.txt changes
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn daphne

# Copy project source
COPY . .

# Ensure static directory exists for WhiteNoise
RUN mkdir -p staticfiles

# Collect static files (Django admin + DRF browsable API)
# OK to fail here — will retry at startup
RUN python manage.py collectstatic --noinput 2>&1 || \
    echo "collectstatic skipped (expected during dev build)"

EXPOSE 8000

# Default: Django dev server (hot-reload via volume mount)
# Override in docker-compose.yml command: field as needed
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
