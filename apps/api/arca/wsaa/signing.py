from cryptography.x509 import Certificate
from cryptography.hazmat.primitives.asymmetric.types import PrivateKeyTypes
from cryptography.hazmat.primitives.serialization import pkcs7
from cryptography.hazmat.primitives import serialization, hashes

import base64


def sign_login_ticket_request(
    xml: str, certificate: Certificate, private_key: PrivateKeyTypes
):
    cms = (
        pkcs7.PKCS7SignatureBuilder()
        .set_data(xml)
        .add_signer(certificate, private_key, hashes.SHA256())
        .sign(serialization.Encoding.DER, [pkcs7.PKCS7Options.Binary])
    )

    return base64.b64encode(cms).decode("ascii")
