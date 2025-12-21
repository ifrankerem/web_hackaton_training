FROM python:3.12-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Create directories
RUN mkdir -p /app/media /app/staticfiles /app/data

# Collect static files
RUN python manage.py collectstatic --noinput

EXPOSE 8000

# Production: use gunicorn
CMD ["sh", "-c", "python manage.py makemigrations todos --noinput && python manage.py migrate --noinput && gunicorn config.wsgi:application --bind 0.0.0.0:${PORT:-8000} --workers 2"]
