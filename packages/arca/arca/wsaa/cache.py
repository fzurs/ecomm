from typing import Protocol, Any
from .types import AccessTicket
from datetime import datetime, timezone


class Cache(Protocol):
    def get(self, key: str) -> Any | None: ...

    def set(
        self,
        key: str,
        value: Any,
        timeout: int | None = None,
    ) -> None: ...


class AccessTicketCache:
    PREFIX = "arca:access_ticket"
    MIN_TTL = 30

    def __init__(self, cache: Cache):
        self._cache = cache

    def _key(self, service: str) -> str:
        return f"{self.PREFIX}:{service}"

    def get(self, service: str) -> AccessTicket | None:
        return self._cache.get(self._key(service))

    def set(self, service: str, access_ticket: AccessTicket) -> None:
        timeout = int(
            (access_ticket.expiration_time - datetime.now(timezone.utc)).total_seconds()
        )

        if timeout <= self.MIN_TTL:
            return

        self._cache.set(self._key(service), access_ticket, timeout=timeout)
