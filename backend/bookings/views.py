from rest_framework import viewsets, permissions, filters
from rest_framework.response import Response
from .models import Session, Booking
from .serializers import SessionSerializer, BookingSerializer
from core.permissions import IsCreator, IsSessionCreatorOwner, IsUser

class SessionViewSet(viewsets.ModelViewSet):
    serializer_class = SessionSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'description', 'category']

    def get_queryset(self):
        queryset = Session.objects.select_related('creator').all().order_by('-created_at')
        if self.action in ['update', 'partial_update', 'destroy']:
            return queryset.filter(creator=self.request.user)
        return queryset

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsCreator(), IsSessionCreatorOwner()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)

class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [IsUser()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_queryset(self):
        user = self.request.user
        if user.role == 'CREATOR':
            return Booking.objects.select_related('session__creator', 'user').filter(session__creator=user).order_by('-created_at')
        return Booking.objects.select_related('session__creator', 'user').filter(user=user).order_by('-created_at')

class StatsView(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        user = request.user
        if user.role == 'CREATOR':
            stats = {
                'total_successful': Booking.objects.filter(session__creator=user, status='CONFIRMED').count(),
                'total_pending': Booking.objects.filter(session__creator=user, status='PENDING').count(),
            }
        else:
            stats = {
                'total_successful': Booking.objects.filter(user=user, status='CONFIRMED').count(),
                'total_pending': Booking.objects.filter(user=user, status='PENDING').count(),
            }
        return Response(stats)
