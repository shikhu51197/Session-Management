from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SessionViewSet, BookingViewSet, StatsView

router = DefaultRouter()
router.register(r'sessions', SessionViewSet, basename='session')
router.register(r'bookings', BookingViewSet, basename='booking')
router.register(r'stats', StatsView, basename='stats')

urlpatterns = [
    path('', include(router.urls)),
]
