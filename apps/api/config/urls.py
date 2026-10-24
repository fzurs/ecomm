from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

import config.schema  # noqa: F401  (registers the OpenAPI extensions)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('auth/', include('dj_rest_auth.urls')),
    path('', include('store.urls')),
    path('', include('orders.urls')),
    path('', include('billing.urls')),
    path('', include('assistant.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
