from django.conf import settings
from django.core.management.base import BaseCommand

from payments.services import cancel_unpaid_orders


class Command(BaseCommand):
    help = ("Cancels the store's orders waiting for a payment longer than UNPAID_ORDER_HOURS, "
            "without one in process. For a cron.")

    def handle(self, *args, **options):
        cancelled = cancel_unpaid_orders()
        for number in cancelled:
            self.stdout.write(f"Cancelled {number}")
        self.stdout.write(self.style.SUCCESS(
            f"{len(cancelled)} unpaid orders cancelled (older than {settings.UNPAID_ORDER_HOURS} h)."))
