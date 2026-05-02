from rest_framework import status, views
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import GoogleAuthSerializer, UserSerializer
from .services import authenticate_google_user
from .throttling import SensitiveActionThrottle

class GoogleLoginView(views.APIView):
    permission_classes = [AllowAny]
    throttle_classes = [SensitiveActionThrottle]

    def post(self, request):
        serializer = GoogleAuthSerializer(data=request.data)
        if serializer.is_valid():
            token = serializer.validated_data['token']
            role = serializer.validated_data.get('role', 'USER')
            is_dev = serializer.validated_data.get('is_dev', False)

            print(f"DEV LOGIN ROLE: {role}")
            try:
                if is_dev:
                    from .models import User
                    user, _ = User.objects.get_or_create(
                        username=f'dev_{role.lower()}',
                        defaults={
                            'email': f'dev_{role.lower()}@example.com',
                            'role': role,
                            'first_name': 'Dev',
                            'last_name': role.capitalize()
                        }
                    )
                else:
                    user = authenticate_google_user(token=token, role=role)
                
                refresh = RefreshToken.for_user(user)

                return Response({
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                    'user': UserSerializer(user).data
                })
            except ValueError as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserProfileView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
