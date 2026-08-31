from abc import ABC, abstractmethod
from .types import AccessTicket
from datetime import datetime, timezone


class AccessTicketCache(ABC):
    @abstractmethod
    def get(self, service: str) -> AccessTicket | None: ...

    @abstractmethod
    def set(self, service: str, access_ticket: AccessTicket) -> None: ...


class DjangoAccessTicketCache(AccessTicketCache):
    PREFIX = "arca:access_ticket"

    def __init__(self, cache_alias="default"):
        from django.core.cache import caches

        self.cache = caches[cache_alias]

    def _key(self, service: str):
        return f"{self.PREFIX}:{service}"

    def get(self, service: str):
        return self.cache.get(self._key(service))

    def set(self, service: str, access_ticket: AccessTicket):
        timeout = int(
            (access_ticket.expiration_time - datetime.now(timezone.utc)).total_seconds()
        )
        if timeout > 30:
            self.cache.set(self._key(service), access_ticket, timeout=timeout)
