FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn
COPY . .
RUN mkdir -p staticfiles && python manage.py collectstatic --noinput || echo "staticfiles skipped"
CMD python manage.py migrate --noinput && python -m gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --log-level debug --access-logfile -
