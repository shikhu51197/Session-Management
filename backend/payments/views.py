from rest_framework import status, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from bookings.models import Booking
from core.throttling import SensitiveUserActionThrottle
from .services import RazorpayPaymentService

class CreateOrderView(views.APIView):
    permission_classes = [IsAuthenticated]
    throttle_classes = [SensitiveUserActionThrottle]

    def post(self, request):
        booking_id = request.data.get('booking_id')
        
        if not RazorpayPaymentService.is_configured():
            return Response({
                'error': 'Razorpay keys are not configured. Please set RAZORPAY_KEY_ID in your .env file.'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            booking = Booking.objects.get(id=booking_id, user=request.user)
            order = RazorpayPaymentService.create_order_for_booking(booking=booking)
            return Response(order, status=status.HTTP_201_CREATED)
        except Booking.DoesNotExist:
            return Response({'error': 'Booking not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            error_msg = str(e)
            if "Authentication failed" in error_msg:
                error_msg = "Razorpay authentication failed. Please check your RAZORPAY_KEY_ID and SECRET."
            return Response({'error': error_msg}, status=status.HTTP_400_BAD_REQUEST)

class VerifyPaymentView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        razorpay_order_id = request.data.get('razorpay_order_id')
        razorpay_payment_id = request.data.get('razorpay_payment_id')
        razorpay_signature = request.data.get('razorpay_signature')

        try:
            RazorpayPaymentService.verify_payment(
                user=request.user,
                razorpay_order_id=razorpay_order_id,
                razorpay_payment_id=razorpay_payment_id,
                razorpay_signature=razorpay_signature,
            )
            return Response({'status': 'Payment verified successfully'})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
