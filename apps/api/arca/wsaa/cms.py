import base64
from cryptography import x509
from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.serialization import pkcs7
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent

def create_cms(data: bytes):
    certificate = x509.load_pem_x509_certificate(open(BASE_DIR / "certificate.pem", "rb").read())
    private_key = serialization.load_pem_private_key(open(BASE_DIR / "private-key.pem", "rb").read(), password=None)

    cms = (
        pkcs7.PKCS7SignatureBuilder()
        .set_data(data)
        .add_signer(
            certificate, 
            private_key, 
            hashes.SHA256()
        )
        .sign(
            serialization.Encoding.DER, 
            [pkcs7.PKCS7Options.Binary]
        )
    )

    return base64.b64encode(cms).decode("ascii")
    
