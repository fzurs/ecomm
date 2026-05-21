from rest_framework import routers
from .views import ProductViewSet, CategoryViewSet, BrandViewSet

router = routers.DefaultRouter()
router.register(r"products", ProductViewSet)
router.register(r"categories", CategoryViewSet)
router.register(r"brands", BrandViewSet)
urlpatterns = router.urls
