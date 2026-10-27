from datetime import datetime, timezone
from functools import cache

from arca_client import WSAA, WSFE, AccessTicket, Environment, cuit_from_certificate
from django.conf import settings
from django.core.cache import BaseCache, caches
from django.core.exceptions import ImproperlyConfigured


def issuer_cuit() -> int:
    """La CUIT emisora: `ARCA_CUIT` si está, si no la del certificado (igual que `WSFE`)."""
    if settings.ARCA_CUIT:
        return int(settings.ARCA_CUIT)
    try:
        cuit = cuit_from_certificate(settings.ARCA_CERTIFICATE_PATH)
    except FileNotFoundError:
        raise ImproperlyConfigured(
            f'No ARCA certificate at {settings.ARCA_CERTIFICATE_PATH}; set ARCA_CUIT or add it.')
    if not cuit:
        raise ImproperlyConfigured('The ARCA certificate has no CUIT; set ARCA_CUIT.')
    return int(cuit)


class DjangoTicketCache:
    """Guarda los Tickets de Acceso en un cache de Django para compartirlos entre workers."""

    PREFIX = "arca:access_ticket"

    def __init__(self, cache: BaseCache):
        self._cache = cache

    def _key(self, key: str) -> str:
        return f"{self.PREFIX}:{key}"

    def get(self, key: str) -> AccessTicket | None:
        data = self._cache.get(self._key(key))
        return AccessTicket.from_dict(data) if data else None

    def set(self, key: str, ticket: AccessTicket) -> None:
        timeout = int((ticket.expiration_time - datetime.now(timezone.utc)).total_seconds())
        if timeout <= 0:
            return

        self._cache.set(self._key(key), ticket.to_dict(), timeout=timeout)


@cache
def get_wsfe() -> WSFE:
    wsaa = WSAA(
        cert=settings.ARCA_CERTIFICATE_PATH,
        key=settings.ARCA_PRIVATE_KEY_PATH,
        env=Environment(settings.ARCA_ENVIRONMENT),
        cache=DjangoTicketCache(caches["arca"]),
    )
    return WSFE(wsaa, cuit=issuer_cuit())
