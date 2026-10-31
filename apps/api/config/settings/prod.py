"""Production settings (wsgi.py and asgi.py default to this module). Secrets come from the
environment only: there are no defaults for them here."""

from pathlib import Path
from urllib.parse import urlsplit

from django.core.exceptions import ImproperlyConfigured

from .base import *  # noqa: F403
from .base import BASE_DIR, CACHES, MEDIA_URL, MIDDLEWARE, STORE_ENABLED, env

DEBUG = False

SECRET_KEY = env("SECRET_KEY")

ALLOWED_HOSTS = env.list("ALLOWED_HOSTS")

# HTTPS only. Behind a proxy that terminates TLS, set SECURE_PROXY_SSL_HEADER so Django knows
# the original request was HTTPS.
SECURE_SSL_REDIRECT = True
# Docker's healthcheck asks from inside the container, over HTTP (config.views.health).
SECURE_REDIRECT_EXEMPT = [r"^health/$"]
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = env.int("SECURE_HSTS_SECONDS", default=60 * 60 * 24 * 365)
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
# The HSTS preload list is hard to leave and binds the whole domain: opt in by hand, not here.
SILENCED_SYSTEM_CHECKS = ["security.W021"]
if env.bool("SECURE_PROXY_SSL_HEADER", default=False):
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

# Emails (accounts, orders), sent for real. The account emails link to the store, so with it
# STORE_URL is required too (base.py builds HEADLESS_FRONTEND_URLS from it).
vars().update(env.email_url("EMAIL_URL"))

# The store charges with Mercado Pago, and paid orders are invoiced in ARCA. Without the store
# (STORE_ENABLED=false) the admin invoices its orders by hand: none of this is needed.
if STORE_ENABLED:
    for name, reason in (
        ("STORE_URL", "the account emails link to the store"),
        ("MERCADOPAGO_ACCESS_TOKEN", "the store's payments"),
        ("MERCADOPAGO_WEBHOOK_SECRET", "the store's payments"),
    ):
        if name not in env.ENVIRON:
            raise ImproperlyConfigured(f"{name}: {reason}")
AUTO_INVOICE = env("AUTO_INVOICE", default="arca")
if AUTO_INVOICE == "sample":
    raise ImproperlyConfigured("AUTO_INVOICE=sample makes up vouchers: never in production")

# The assistant sends customers' data to Anthropic (an international transfer, Ley 25.326): off
# until the privacy policy declares it. See docs/production.md.
ASSISTANT_ENABLED = env.bool("ASSISTANT_ENABLED", default=False)

# Shared by every worker: allauth's rate limits (failed logins, codes) count per process otherwise.
CACHES = {
    **CACHES,
    "default": {
        "BACKEND": "django.core.cache.backends.redis.RedisCache",
        "LOCATION": env("REDIS_URL", default="redis://127.0.0.1:6379"),
        "KEY_PREFIX": "default",
    },
}

# The images' public URL (base.py's default is localhost's): the custom domain of the R2 bucket
# that keeps them, at its root.
if "MEDIA_URL" not in env.ENVIRON:
    raise ImproperlyConfigured("MEDIA_URL: the public URL of the product images")
_media = urlsplit(MEDIA_URL)
if _media.scheme != "https" or _media.path != "/":
    raise ImproperlyConfigured("MEDIA_URL: the bucket's domain, as https://<host>/")
DEFAULT_FROM_EMAIL = env("DEFAULT_FROM_EMAIL")

MIDDLEWARE = [MIDDLEWARE[0], "whitenoise.middleware.WhiteNoiseMiddleware", *MIDDLEWARE[1:]]
STORAGES = {
    # Uploaded images (products, customers) in Cloudflare R2: the servers' disks don't keep them.
    # Their URLs are the bucket's public domain, without signatures.
    "default": {
        "BACKEND": "storages.backends.s3.S3Storage",
        "OPTIONS": {
            "endpoint_url": f"https://{env('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com",
            "region_name": "auto",
            "bucket_name": env("R2_BUCKET"),
            "access_key": env("R2_ACCESS_KEY_ID"),
            "secret_key": env("R2_SECRET_ACCESS_KEY"),
            "custom_domain": _media.netloc,
            "querystring_auth": False,
            "file_overwrite": False,
        },
    },
    # Static files of the Django admin, served by the app itself.
    "staticfiles": {"BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"},
}

# ARCA: the environment is chosen explicitly, and the certificate and its key live on the server,
# outside the repo (never under apps/api/certs/).
ARCA_ENVIRONMENT = env("ARCA_ENVIRONMENT")
ARCA_CERTIFICATE_PATH = Path(env("ARCA_CERTIFICATE_PATH"))
ARCA_PRIVATE_KEY_PATH = Path(env("ARCA_PRIVATE_KEY_PATH"))
for _path in (ARCA_CERTIFICATE_PATH, ARCA_PRIVATE_KEY_PATH):
    if not _path.is_absolute() or _path.is_relative_to(BASE_DIR):
        raise ImproperlyConfigured(f"{_path}: ARCA paths must be absolute and outside {BASE_DIR}")
    if not _path.is_file():
        raise ImproperlyConfigured(f"{_path}: file not found")
