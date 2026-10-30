from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from drf_spectacular.utils import extend_schema
from rest_framework import permissions
from rest_framework.generics import RetrieveUpdateAPIView

from .serializers import UserDetailsSerializer


# The admin and the store read the session from here. It also (re)sets the csrftoken cookie,
# even without a session (403): the login (allauth) needs it too, and without it a cleared or
# expired cookie would leave every write failing with "CSRF cookie not set". PATCH changes the
# name (the store's account page).
@method_decorator(ensure_csrf_cookie, name='dispatch')
class UserDetailsView(RetrieveUpdateAPIView):
    serializer_class = UserDetailsSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'patch', 'head', 'options']

    def get_object(self):
        return self.request.user

    @extend_schema(operation_id='auth_user_retrieve')
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @extend_schema(operation_id='auth_user_partial_update')
    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)
