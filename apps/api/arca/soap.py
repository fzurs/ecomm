from .namespaces import SOAP_ENV, WSAA_ENV, WSFE_ENV


def tag(namespace: str, name: str):
    return f"{{{namespace}}}{name}"


def soap_tag(name: str):
    return tag(SOAP_ENV, name)


def wsaa_tag(name: str):
    return tag(WSAA_ENV, name)


def wsfe_tag(name: str):
    return tag(WSFE_ENV, name)
