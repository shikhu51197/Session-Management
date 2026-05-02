from django.conf import settings
from google.auth.transport import requests
from google.oauth2 import id_token

from .models import User


def authenticate_google_user(*, token: str, role: str) -> User:
    idinfo = id_token.verify_oauth2_token(
        token,
        requests.Request(),
        settings.GOOGLE_OAUTH_CLIENT_ID,
    )

    if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
        raise ValueError('Wrong issuer.')

    email = idinfo['email']
    user, _ = User.objects.get_or_create(
        email=email,
        defaults={
            'username': email,
            'first_name': idinfo.get('given_name', ''),
            'last_name': idinfo.get('family_name', ''),
            'role': role,
        },
    )
    return user
