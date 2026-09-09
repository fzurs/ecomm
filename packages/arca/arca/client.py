from .wsaa.client import WSAAClient

from .wsaa.types import ARCACredentials
from .wsaa.cache import AccessTicketCache

from .wsfe.client import WSFEClient


class ARCAClient:
    def __init__(self, credentials: ARCACredentials, cache: AccessTicketCache):
        self.wsaa = WSAAClient(credentials=credentials, cache=cache)
        self.wsfe = WSFEClient(cuit=credentials.cuit, wsaa_client=self.wsaa)
