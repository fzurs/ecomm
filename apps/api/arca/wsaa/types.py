from dataclasses import dataclass

from datetime import datetime


@dataclass(frozen=True)
class AccessTicket:
    token: str
    sign: str
    expiration_time: datetime
