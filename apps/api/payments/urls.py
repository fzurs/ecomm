from django.urls import path

from .views import MercadoPagoWebhookView

urlpatterns = [
    path("payments/webhooks/mercadopago/", MercadoPagoWebhookView.as_view(), name="mercadopago-webhook"),
]
