from urllib.parse import urlsplit

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import Http404

from accounts.admin_site import MFAAdminSite


def no_provider_redirect(request):
    # Google logs in with an ID token from the store's button (/auth/provider/token). The redirect
    # flow would bring the browser back to the API's own host, outside the store's /api, and its
    # callback isn't mounted: without this it fails with a 500.
    raise Http404


urlpatterns = [
    path('auth/', include('accounts.urls')),
    path('_allauth/browser/v1/auth/provider/redirect', no_provider_redirect),
    path('_allauth/', include('allauth.headless.urls')),
    path('', include('store.urls')),
    path('', include('orders.urls')),
    path('', include('billing.urls')),
    path('', include('assistant.urls')),
    path('', include('checkout.urls')),
    path('', include('payments.urls')),
]

if settings.DJANGO_ADMIN_URL:
    if settings.REQUIRE_2FA:
        # Only sessions that passed the second factor in (the Django admin's own login doesn't
        # ask for it): Django's documented way to change the default site's behaviour.
        admin.site.__class__ = MFAAdminSite
    urlpatterns.append(path(settings.DJANGO_ADMIN_URL, admin.site.urls))

# Media served by Django in development only (static() is a no-op without DEBUG anyway). By the
# path of MEDIA_URL: static() serves nothing for an absolute URL.
if settings.DEBUG:
    urlpatterns += static(urlsplit(settings.MEDIA_URL).path, document_root=settings.MEDIA_ROOT)
