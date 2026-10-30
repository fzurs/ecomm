from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from drf_spectacular.utils import extend_schema
from rest_framework import permissions
from rest_framework.generics import RetrieveAPIView

from .serializers import UserDetailsSerializer


# The admin reads the session from here when it loads. It also (re)sets the csrftoken cookie,
# even without a session (403): the login (allauth) needs it too, and without it a cleared or
# expired cookie would leave every write failing with "CSRF cookie not set".
@method_decorator(ensure_csrf_cookie, name='dispatch')
class UserDetailsView(RetrieveAPIView):
    serializer_class = UserDetailsSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    @extend_schema(operation_id='auth_user_retrieve')
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)
