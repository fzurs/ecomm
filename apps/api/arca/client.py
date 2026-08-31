from pathlib import Path
from .wsaa.client import WSAAClient
from .wsfe.client import WSFEClient
from .wsaa.cache import DjangoAccessTicketCache

BASE_DIR = Path(__file__).resolve().parent.parent

CUIT = "20440237577"
CERTIFICATE_PATH = BASE_DIR / "certificate.pem"
PRIVATE_KEY_PATH = BASE_DIR / "private-key.pem"


class ARCAClient:
    def __init__(self, wsaa_cache=None):
        self.wsaa = WSAAClient(
            CERTIFICATE_PATH,
            PRIVATE_KEY_PATH,
            cache=wsaa_cache if wsaa_cache is not None else DjangoAccessTicketCache(),
        )
        self.electronic_billing = WSFEClient(cuit=CUIT, wsaa_client=self.wsaa)
