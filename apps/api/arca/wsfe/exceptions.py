from .types import WSFEMessage


class WSFEError(Exception):
    def __init__(self, errors: list[WSFEMessage]):
        self.errors = errors
        details = "\n".join(f"[{error.code}]: {error.message}" for error in errors)
        super().__init__(f"WSFE returned errors\n{details}")
