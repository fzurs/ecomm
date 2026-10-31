import logging

from django.conf import settings
from django.core.cache import caches
from django.db import connection
from django.http import JsonResponse
from django.views.decorators.http import require_GET

logger = logging.getLogger(__name__)


@require_GET
def health(request):
    """For Docker's healthcheck and the uptime monitor (through the admin's /api): the database
    and the caches (Redis in production) answer. No session nor data: anybody can ask."""
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        for alias in settings.CACHES:
            caches[alias].get("health")
    except Exception:
        logger.exception("Health check failed")
        return JsonResponse({"status": "unavailable"}, status=503)
    return JsonResponse({"status": "ok"})
