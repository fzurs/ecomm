import json
from pathlib import Path

from allauth.headless.spec.internal.schema import get_schema
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Writes allauth headless' OpenAPI spec (as configured here) for the frontends' client."

    def add_arguments(self, parser):
        parser.add_argument('--file', type=Path, required=True)

    def handle(self, *args, file, **options):
        file.write_text(json.dumps(get_schema(), indent=2))
