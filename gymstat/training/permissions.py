from rest_framework import permissions


class IsOwnerAllIsAdminSafe(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit or delete it.
    """

    def has_object_permission(self, request, view, obj):
        # SAFE_METHODS
        if request.method in permissions.SAFE_METHODS:
            return obj.is_admin or obj.owner == request.user

        # For unsafe methods
        return obj.owner == request.user
