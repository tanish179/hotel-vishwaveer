import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyRazorpayPaymentSignature } from '@/lib/razorpay';

export async function POST(request: Request) {
  try {
    const { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature } =
      await request.json();

    if (!bookingId || !razorpayPaymentId) {
      return NextResponse.json(
        { success: false, error: 'Missing critical payment verification credentials' },
        { status: 400 }
      );
    }

    const booking = db.getBookingById(bookingId);
    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Reservation record not found' },
        { status: 404 }
      );
    }

    // Cryptographic HMAC-SHA256 Signature Verification
    const isValidSignature = verifyRazorpayPaymentSignature({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
    });

    if (!isValidSignature) {
      db.logAudit({
        actor_id: 'security_firewall',
        action: 'PAYMENT_SIGNATURE_TAMPER_DETECTED',
        entity_type: 'booking',
        entity_id: bookingId,
        changes: { razorpayOrderId, razorpayPaymentId },
      });

      return NextResponse.json(
        { success: false, error: 'Cryptographic signature verification failed. Tampering detected.' },
        { status: 400 }
      );
    }

    // Authoritative Confirmation in Database
    const confirmation = db.confirmBookingPayment({
      bookingId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      amountPaise: booking.advance_amount_paise,
      paymentMethod: 'razorpay',
      paymentType: 'advance_online',
      recordedBy: 'razorpay_verification_endpoint',
    });

    if (!confirmation.success || !confirmation.booking) {
      return NextResponse.json(
        { success: false, error: confirmation.error || 'Failed to confirm reservation.' },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      booking: confirmation.booking,
      bookingReference: confirmation.booking.booking_reference,
      amountPaidPaise: confirmation.booking.advance_paid_paise,
      balanceDuePaise: confirmation.booking.balance_amount_paise,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
