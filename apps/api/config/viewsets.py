from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import permissions
from rest_framework.decorators import action
from rest_framework.response import Response


# Lets anyone run `public_actions` (the store reads them); the rest use the default permissions.
# A comment, not a docstring: drf-spectacular would inherit it as every endpoint's description.
class PublicReadMixin:
    public_actions = ["list", "retrieve", "choices"]

    def get_permissions(self):
        if self.action in self.public_actions:
            return [permissions.AllowAny()]
        return super().get_permissions()


# Adds `choices`: the filtered queryset, unpaginated, with `choices_serializer_class` (feeds the
# admin selects). Each viewset documents it with `choices_schema`, to keep its operation_id.
class ChoicesMixin:
    choices_serializer_class = None

    def get_serializer_class(self):
        if self.action == "choices":
            return self.choices_serializer_class
        return super().get_serializer_class()

    @action(detail=False, methods=["get"], pagination_class=None)
    def choices(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


def choices_schema(operation_id, serializer_class):
    return extend_schema_view(
        choices=extend_schema(operation_id=operation_id, responses=serializer_class(many=True)))
