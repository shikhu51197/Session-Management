from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role', 'avatar')
        read_only_fields = ('id', 'username', 'email', 'role')

class GoogleAuthSerializer(serializers.Serializer):
    token = serializers.CharField()
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES, required=False)
    is_dev = serializers.BooleanField(required=False, default=False)
