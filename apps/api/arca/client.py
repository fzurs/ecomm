from pathlib import Path
from wsaa.client import WSAAClient
from wsfe.client import WSFEClient

BASE_DIR = Path(__file__).resolve().parent.parent

CUIT = "20440237577"
CERTIFICATE_PATH = BASE_DIR / "certificate.pem"
PRIVATE_KEY_PATH = BASE_DIR / "private-key.pem"


class ARCAClient:
    def __init__(self):
        self._wsaa_client = WSAAClient(
            certificate_path=CERTIFICATE_PATH, private_key_path=PRIVATE_KEY_PATH
        )
        self.electronic_billing = WSFEClient(cuit=CUIT, wsaa_client=self._wsaa_client)
