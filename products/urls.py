from rest_framework import routers
from .views import ProductViewSet, InventoryViewSet

router = routers.DefaultRouter()
router.register(r'products', ProductViewSet)
router.register(r'inventory', InventoryViewSet)

urlpatterns = router.urls
