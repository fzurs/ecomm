from django.urls import path

from . import views

# Mounted under auth/. Logging in and out, and 2FA, are allauth's (/_allauth/browser/v1/...).
urlpatterns = [
    path('user/', views.UserDetailsView.as_view(), name='user-details'),
]
