from dataclasses import dataclass

from datetime import datetime, timezone, timedelta


@dataclass(frozen=True)
class AccessTicket:
    token: str
    sign: str
    expiration_time: datetime

    @property
    def is_expired(self):
        return datetime.now(timezone.utc) >= (
            self.expiration_time - timedelta(seconds=30)
        )
