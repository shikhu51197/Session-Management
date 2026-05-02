from django.urls import path
from .views import GoogleLoginView, UserProfileView

urlpatterns = [
    path('auth/google/', GoogleLoginView.as_view(), name='google_login'),
    path('auth/me/', UserProfileView.as_view(), name='user_profile'),
]
