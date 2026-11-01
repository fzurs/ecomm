# The API in production (docs/production.md, deploy/compose.yml). Build context: apps/api.

FROM python:3.14-slim AS build
# arca-client is installed from GitHub (requirements.txt).
RUN apt-get update && apt-get install -y --no-install-recommends git \
    && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip wheel --no-cache-dir --wheel-dir /wheels -r requirements.txt

FROM python:3.14-slim
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DJANGO_SETTINGS_MODULE=config.settings.prod
RUN --mount=type=bind,from=build,source=/wheels,target=/wheels \
    pip install --no-cache-dir --no-index /wheels/*
RUN useradd --system --uid 10001 --create-home --home-dir /app app
WORKDIR /app
COPY --chown=app:app . .
USER app
EXPOSE 8000
# collectstatic on start: prod.py needs the server's environment. Then gunicorn, with room for
# ARCA's slow answers. Each worker is a Django process (~100-150 MB): WEB_CONCURRENCY in api.env
# sets how many, 3 by default.
CMD ["sh", "-c", "python manage.py collectstatic --noinput -v0 && exec gunicorn config.wsgi --bind 0.0.0.0:8000 --workers ${WEB_CONCURRENCY:-3} --timeout 60 --access-logfile -"]
