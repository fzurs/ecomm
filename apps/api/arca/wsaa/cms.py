import base64
from cryptography import x509
from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.serialization import pkcs7

def create_cms(data: bytes, certificate_path: str, private_key_path: str):
    certificate = x509.load_pem_x509_certificate(open(certificate_path, "rb").read())
    private_key = serialization.load_pem_private_key(open(private_key_path, "rb").read(), password=None)

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
    
