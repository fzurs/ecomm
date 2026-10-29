from django.urls import path, re_path

from . import views

# Mounted under auth/, before dj-rest-auth's urls: this login replaces theirs, with their same
# pattern (with or without the trailing slash), so neither form reaches theirs.
urlpatterns = [
    re_path(r'login/?$', views.LoginView.as_view(), name='rest_login'),
    path('2fa/setup/', views.TwoFactorSetupView.as_view(), name='2fa-setup'),
    path('2fa/confirm/', views.TwoFactorConfirmView.as_view(), name='2fa-confirm'),
    path('2fa/disable/', views.TwoFactorDisableView.as_view(), name='2fa-disable'),
]
