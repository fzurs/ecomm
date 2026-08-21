from dataclasses import dataclass


@dataclass(frozen=True)
class CurrencyType:
    id: str
    name: str