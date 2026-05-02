from rest_framework import permissions

class IsCreator(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'CREATOR')

class IsUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'USER')

class IsSessionCreatorOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == 'CREATOR'
            and obj.creator_id == request.user.id
        )
