from rest_framework import routers
from .views import OrderViewSet, CustomerViewSet

router = routers.DefaultRouter()
router.register(r"orders", OrderViewSet)
router.register(r"customers", CustomerViewSet)
urlpatterns = router.urls
