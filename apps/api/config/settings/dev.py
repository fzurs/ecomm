"""Development settings: the devcontainer and the tests (manage.py defaults to this module)."""

from .base import *  # noqa: F403

DEBUG = True

# Dev only: production reads SECRET_KEY from the environment (prod.py).
SECRET_KEY = "django-insecure--+zy6lf9%pd+f2*0r-@8(njuc(8bvlu%!p@j*#bb=gaf-f+6o9"

ALLOWED_HOSTS = ["*"]

DJANGO_ADMIN_URL = env("DJANGO_ADMIN_URL", default="admin/")  # noqa: F405
