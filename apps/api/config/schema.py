from drf_spectacular.extensions import OpenApiViewExtension
from drf_spectacular.utils import extend_schema


class SessionLoginView(OpenApiViewExtension):
    """
    dj-rest-auth runs with sessions only (REST_AUTH TOKEN_MODEL None), so login
    answers 204 without a token. drf-spectacular's bundled extension documents
    the TokenSerializer instead, which can't be built without a token model.
    """

    target_class = "dj_rest_auth.views.LoginView"
    priority = 1

    def view_replacement(self):
        class Fixed(self.target_class):
            @extend_schema(responses={204: None})
            def post(self, request, *args, **kwargs):
                pass  # pragma: no cover

        return Fixed
