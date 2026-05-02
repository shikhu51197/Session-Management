from rest_framework import serializers
from .models import Session, Booking
from core.serializers import UserSerializer

class SessionSerializer(serializers.ModelSerializer):
    creator = UserSerializer(read_only=True)
    price = serializers.FloatField()
    
    class Meta:
        model = Session
        fields = '__all__'

class BookingSerializer(serializers.ModelSerializer):
    session = SessionSerializer(read_only=True)
    session_id = serializers.PrimaryKeyRelatedField(
        queryset=Session.objects.all(), source='session', write_only=True
    )
    user = UserSerializer(read_only=True)

    class Meta:
        model = Booking
        fields = '__all__'

    def validate(self, attrs):
        request = self.context.get('request')
        session = attrs.get('session')

        if request and session and session.creator_id == request.user.id:
            raise serializers.ValidationError('Creators cannot book their own sessions.')

        return attrs
