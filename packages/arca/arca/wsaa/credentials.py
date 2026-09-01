from pathlib import Path

from cryptography import x509
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric.types import PrivateKeyTypes


def load_certificate(path: Path) -> x509.Certificate:
    return x509.load_pem_x509_certificate(path.read_bytes())


def load_private_key(path: Path) -> PrivateKeyTypes:
    return serialization.load_pem_private_key(path.read_bytes(), password=None)
