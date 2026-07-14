from functools import lru_cache
from afip import Afip
from django.conf import settings

@lru_cache(maxsize=1)
def get_afip_client():
    with open(settings.AFIPSDK_CERT_PATH) as cert_file:
        cert = cert_file.read()

    with open(settings.AFIPSDK_KEY_PATH) as key_file:
        key = key_file.read()

    return Afip({
        "CUIT": settings.AFIPSDK_CUIT,
        "cert": cert,
        "key": key,
    })
