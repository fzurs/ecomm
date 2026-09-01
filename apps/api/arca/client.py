from .wsaa.client import WSAAClient
from .wsfe.client import WSFEClient
from .wsaa.cache import AccessTicketCache, DjangoAccessTicketCache
from .types import ARCACredentials


class ARCAClient:
    def __init__(self, credentials: ARCACredentials, cache=DjangoAccessTicketCache()):
        self.wsaa = WSAAClient(credentials=credentials, cache=cache)
        self.wsfe = WSFEClient(cuit=credentials.cuit, wsaa_client=self.wsaa)
