from rest_framework import permissions


class IsOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.owner == request.user


class IsAdminReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return obj.admin
        else:
            return False


class IsOwnerAllIsAdminSafe(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit or delete it.
    """

    def has_object_permission(self, request, view, obj):
        # SAFE_METHODS (GET, HEAD, OPTIONS)
        if request.method in permissions.SAFE_METHODS:
            return obj.admin or obj.owner == request.user

        # For unsafe methods (PUT, PATCH, DELETE)
        return obj.owner == request.user
