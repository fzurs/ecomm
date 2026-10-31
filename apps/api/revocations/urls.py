from django.urls import path
from rest_framework import routers

from .views import RevocationCreateView, RevocationRequestViewSet

router = routers.DefaultRouter()
router.register(r"revocations", RevocationRequestViewSet, basename="revocation")

urlpatterns = [
    path("revocations/request/", RevocationCreateView.as_view(), name="revocation-request"),
    *router.urls,
]
