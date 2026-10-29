from django.contrib import admin
from django_otp.admin import OTPAdminSite
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

import config.schema  # noqa: F401  (registers the OpenAPI extensions)

urlpatterns = [
    path('auth/', include('accounts.urls')),
    path('auth/', include('dj_rest_auth.urls')),
    path('', include('store.urls')),
    path('', include('orders.urls')),
    path('', include('billing.urls')),
    path('', include('assistant.urls')),
]

if settings.DJANGO_ADMIN_URL:
    if settings.REQUIRE_2FA:
        # django-otp's documented switch: the login asks for the code, and only verified staff in.
        admin.site.__class__ = OTPAdminSite
    urlpatterns.append(path(settings.DJANGO_ADMIN_URL, admin.site.urls))

# Media served by Django in development only (static() is a no-op without DEBUG anyway).
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
