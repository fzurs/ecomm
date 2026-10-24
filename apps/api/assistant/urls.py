from rest_framework import routers
from .views import ConversationViewSet

router = routers.DefaultRouter()
router.register(r"assistant/conversations", ConversationViewSet, basename="conversation")
urlpatterns = router.urls
