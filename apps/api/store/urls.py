from rest_framework import routers
from .views import (
    CustomerViewSet,
    CategoryViewSet,
    BrandViewSet,
    ProductViewSet,
    OrderViewSet,
)

router = routers.DefaultRouter()
router.register(r"customers", CustomerViewSet)
router.register(r"categories", CategoryViewSet)
router.register(r"brands", BrandViewSet)
router.register(r"products", ProductViewSet)
router.register(r"orders", OrderViewSet)
urlpatterns = router.urls
