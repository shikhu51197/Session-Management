from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import User


class UserProfileTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='user@example.com',
            email='user@example.com',
            first_name='Old',
            last_name='Name',
            role='USER',
        )

    def test_authenticated_user_can_update_profile_details(self):
        self.client.force_authenticate(self.user)

        response = self.client.patch(
            reverse('user_profile'),
            {'first_name': 'New', 'last_name': 'Person', 'role': 'CREATOR'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, 'New')
        self.assertEqual(self.user.last_name, 'Person')
        self.assertEqual(self.user.role, 'USER')

    def test_anonymous_user_cannot_read_profile(self):
        response = self.client.get(reverse('user_profile'))

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
