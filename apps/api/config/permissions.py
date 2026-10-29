from rest_framework.permissions import DjangoModelPermissions


class StaffModelPermissions(DjangoModelPermissions):
    """The default: staff only, with the model permission of the method. Unlike DRF's, reading
    needs `view_<model>` too. Custom actions follow their method: a POST action needs `add`."""

    perms_map = {
        **DjangoModelPermissions.perms_map,
        'GET': ['%(app_label)s.view_%(model_name)s'],
        'HEAD': ['%(app_label)s.view_%(model_name)s'],
    }

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_staff) and super().has_permission(request, view)
