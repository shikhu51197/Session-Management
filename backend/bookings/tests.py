from datetime import timedelta

from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from core.models import User
from .models import Booking, Session


class SessionPermissionTests(APITestCase):
    def setUp(self):
        self.creator = User.objects.create_user(
            username='creator@example.com',
            email='creator@example.com',
            role='CREATOR',
        )
        self.other_creator = User.objects.create_user(
            username='other@example.com',
            email='other@example.com',
            role='CREATOR',
        )
        self.user = User.objects.create_user(
            username='user@example.com',
            email='user@example.com',
            role='USER',
        )
        self.session = Session.objects.create(
            creator=self.creator,
            title='System Design Review',
            description='A practical review session.',
            price='2500.00',
            duration=60,
            category='Backend Engineering',
        )

    def test_creator_can_create_session(self):
        self.client.force_authenticate(self.creator)

        response = self.client.post(
            reverse('session-list'),
            {
                'title': 'Frontend Architecture',
                'description': 'Deep dive into Next.js architecture.',
                'price': '1500.00',
                'duration': 45,
                'category': 'Frontend Architecture',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Session.objects.filter(creator=self.creator).count(), 2)

    def test_user_cannot_create_session(self):
        self.client.force_authenticate(self.user)

        response = self.client.post(
            reverse('session-list'),
            {
                'title': 'Invalid',
                'description': 'Should not be created.',
                'price': '500.00',
                'duration': 30,
                'category': 'General',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_creator_cannot_update_another_creators_session(self):
        self.client.force_authenticate(self.other_creator)

        response = self.client.patch(
            reverse('session-detail', args=[self.session.id]),
            {'title': 'Taken Over'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.session.refresh_from_db()
        self.assertEqual(self.session.title, 'System Design Review')


class BookingPermissionTests(APITestCase):
    def setUp(self):
        self.creator = User.objects.create_user(
            username='creator@example.com',
            email='creator@example.com',
            role='CREATOR',
        )
        self.user = User.objects.create_user(
            username='user@example.com',
            email='user@example.com',
            role='USER',
        )
        self.session = Session.objects.create(
            creator=self.creator,
            title='Career Mentoring',
            description='Career planning session.',
            price='1000.00',
            duration=60,
            category='Career Growth',
        )
        self.start_time = timezone.now() + timedelta(days=1)
        self.end_time = self.start_time + timedelta(hours=1)

    def test_user_can_book_session(self):
        self.client.force_authenticate(self.user)

        response = self.client.post(
            reverse('booking-list'),
            {
                'session_id': self.session.id,
                'start_time': self.start_time.isoformat(),
                'end_time': self.end_time.isoformat(),
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Booking.objects.filter(user=self.user, session=self.session).count(), 1)

    def test_creator_cannot_create_booking(self):
        self.client.force_authenticate(self.creator)

        response = self.client.post(
            reverse('booking-list'),
            {
                'session_id': self.session.id,
                'start_time': self.start_time.isoformat(),
                'end_time': self.end_time.isoformat(),
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
