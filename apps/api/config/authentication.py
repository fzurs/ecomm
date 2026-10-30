from drf_spectacular.extensions import OpenApiAuthenticationExtension
from rest_framework.authentication import SessionAuthentication


class CsrfSessionAuthentication(SessionAuthentication):
    """SessionAuthentication checks CSRF only for a logged-in user. The store's cart and checkout
    also take writes from guests, whose session is their cart: they need it too."""

    def authenticate(self, request):
        user_auth = super().authenticate(request)
        if user_auth is None:
            self.enforce_csrf(request)
        return user_auth


class CsrfSessionScheme(OpenApiAuthenticationExtension):
    # The same cookie as SessionAuthentication's (cookieAuth), under a name of its own: the schema
    # takes one class per name.
    target_class = CsrfSessionAuthentication
    name = "storeCookieAuth"

    def get_security_definition(self, auto_schema):
        return {"type": "apiKey", "in": "cookie", "name": "sessionid"}
