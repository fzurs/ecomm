from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from accounts.admin_site import MFAAdminSite

urlpatterns = [
    path('auth/', include('accounts.urls')),
    path('_allauth/', include('allauth.headless.urls')),
    path('', include('store.urls')),
    path('', include('orders.urls')),
    path('', include('billing.urls')),
    path('', include('assistant.urls')),
]

if settings.DJANGO_ADMIN_URL:
    if settings.REQUIRE_2FA:
        # Only sessions that passed the second factor in (the Django admin's own login doesn't
        # ask for it): Django's documented way to change the default site's behaviour.
        admin.site.__class__ = MFAAdminSite
    urlpatterns.append(path(settings.DJANGO_ADMIN_URL, admin.site.urls))

# Media served by Django in development only (static() is a no-op without DEBUG anyway).
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
