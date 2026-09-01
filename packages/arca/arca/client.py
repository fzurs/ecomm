from .wsaa.client import WSAAClient
from .wsaa.cache import AccessTicketCache, DjangoAccessTicketCache
from .wsaa.types import ARCACredentials

from .wsfe.client import WSFEClient


class ARCAClient:
    def __init__(
        self,
        credentials: ARCACredentials,
        cache: AccessTicketCache = DjangoAccessTicketCache(),
    ):
        self.wsaa = WSAAClient(credentials=credentials, cache=cache)
        self.wsfe = WSFEClient(cuit=credentials.cuit, wsaa_client=self.wsaa)
