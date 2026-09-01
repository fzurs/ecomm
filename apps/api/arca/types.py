from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class ARCACredentials:
    cuit: str
    certificate_path: Path
    private_key_path: Path
