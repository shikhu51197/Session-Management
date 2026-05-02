import razorpay
from django.conf import settings

from bookings.models import Booking

from .models import Payment


class RazorpayPaymentService:
    @staticmethod
    def _client():
        return razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

    @staticmethod
    def is_configured():
        return bool(settings.RAZORPAY_KEY_ID and settings.RAZORPAY_KEY_SECRET and 'replace_me' not in settings.RAZORPAY_KEY_ID)

    @classmethod
    def create_order_for_booking(cls, *, booking: Booking):
        amount = int(booking.session.price * 100)
        order = cls._client().order.create(data={
            'amount': amount,
            'currency': 'INR',
            'receipt': str(booking.id),
        })

        Payment.objects.create(
            user=booking.user,
            booking=booking,
            amount=booking.session.price,
            razorpay_order_id=order['id'],
        )
        return order

    @classmethod
    def verify_payment(cls, *, user, razorpay_order_id, razorpay_payment_id, razorpay_signature):
        try:
            cls._client().utility.verify_payment_signature({
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature,
            })

            payment = Payment.objects.select_related('booking').get(
                razorpay_order_id=razorpay_order_id,
                user=user,
            )
            payment.razorpay_payment_id = razorpay_payment_id
            payment.razorpay_signature = razorpay_signature
            payment.status = 'COMPLETED'
            payment.save(update_fields=['razorpay_payment_id', 'razorpay_signature', 'status'])

            payment.booking.status = 'CONFIRMED'
            payment.booking.save(update_fields=['status'])
            return payment
        except Exception as e:
            # Explicitly mark as FAILED if verification fails
            Payment.objects.filter(
                razorpay_order_id=razorpay_order_id,
                user=user
            ).update(status='FAILED')
            raise e
