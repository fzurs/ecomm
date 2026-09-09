from django.conf import settings
from django.core.cache import caches

from arca.client import ARCAClient
from arca.wsaa.types import ARCACredentials
from arca.wsaa.cache import AccessTicketCache


def get_arca_client(cache_alias: str = "default") -> ARCAClient:
    return ARCAClient(
        credentials=ARCACredentials(
            cuit=settings.ARCA_CUIT,
            certificate_path=settings.ARCA_CERTIFICATE_PATH,
            private_key_path=settings.ARCA_PRIVATE_KEY_PATH,
        ),
        cache=AccessTicketCache(caches[cache_alias]),
    )


arca_client = get_arca_client()
