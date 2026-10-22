from collections import Counter

from django.db.models import ProtectedError
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler as drf_exception_handler


def exception_handler(exc, context):
    # Deleting a row that a PROTECT foreign key points to is a conflict, not a server error.
    if isinstance(exc, ProtectedError):
        return Response({'detail': protected_error_message(exc)}, status=status.HTTP_409_CONFLICT)
    return drf_exception_handler(exc, context)


def protected_error_message(exc: ProtectedError) -> str:
    counts = Counter(obj._meta for obj in exc.protected_objects)
    references = ', '.join(
        f'{count} {meta.verbose_name if count == 1 else meta.verbose_name_plural}'
        for meta, count in counts.items()
    )
    return f"It can't be deleted because it's used in {references}."
