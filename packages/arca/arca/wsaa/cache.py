from typing import Protocol
from .types import AccessTicket
from datetime import datetime, timezone


class AccessTicketCache(Protocol):
    def get(self, service: str) -> AccessTicket | None: ...

    def set(self, service: str, access_ticket: AccessTicket) -> None: ...


class DjangoAccessTicketCache:
    PREFIX = "arca:access_ticket"

    def __init__(self, cache_alias="default"):
        from django.core.cache import caches

        self.cache = caches[cache_alias]

    def _key(self, service: str):
        return f"{self.PREFIX}:{service}"

    def get(self, service: str) -> AccessTicket:
        return self.cache.get(self._key(service))

    def set(self, service: str, access_ticket: AccessTicket) -> None:
        timeout = int(
            (access_ticket.expiration_time - datetime.now(timezone.utc)).total_seconds()
        )
        if timeout > 30:
            self.cache.set(self._key(service), access_ticket, timeout=timeout)
