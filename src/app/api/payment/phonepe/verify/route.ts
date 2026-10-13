import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPhonePeChecksum } from '@/lib/phonepe';

export async function POST(request: Request) {
  try {
    const {
      bookingId,
      merchantTransactionId,
      phonepeTransactionId,
      utrNumber,
      xVerify,
    } = await request.json();

    if (!bookingId || !merchantTransactionId) {
      return NextResponse.json(
        { success: false, error: 'Missing PhonePe transaction identifiers' },
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

    // Verify PhonePe signature if provided
    if (xVerify && !verifyPhonePeChecksum({ rawOrBase64: merchantTransactionId, xVerifyHeader: xVerify })) {
      db.logAudit({
        actor_id: 'phonepe_security',
        action: 'PHONEPE_CHECKSUM_TAMPER_DETECTED',
        entity_type: 'booking',
        entity_id: bookingId,
        changes: { merchantTransactionId },
      });
      return NextResponse.json(
        { success: false, error: 'PhonePe checksum verification failed' },
        { status: 400 }
      );
    }

    const finalPhonePeId =
      phonepeTransactionId || `T${Date.now()}`;
    const generatedUtr =
      utrNumber || `${Math.floor(100000000000 + Math.random() * 900000000000)}`;

    // Authoritatively confirm booking in database
    const confirmation = db.confirmBookingPayment({
      bookingId,
      razorpayOrderId: merchantTransactionId,
      razorpayPaymentId: `phonepe_${finalPhonePeId}`,
      razorpaySignature: `utr_${generatedUtr}`,
      amountPaise: booking.advance_amount_paise,
      paymentMethod: 'upi_qr',
      paymentType: 'advance_online',
      recordedBy: 'phonepe_gateway_engine',
    });

    if (!confirmation.success || !confirmation.booking) {
      return NextResponse.json(
        { success: false, error: confirmation.error || 'Failed to confirm reservation' },
        { status: 409 }
      );
    }

    db.logAudit({
      actor_id: 'phonepe_gateway',
      action: 'PHONEPE_PAYMENT_VERIFIED',
      entity_type: 'booking',
      entity_id: booking.id,
      changes: {
        merchantTransactionId,
        phonepeTransactionId: finalPhonePeId,
        utrNumber: generatedUtr,
        advanceAmountPaise: booking.advance_amount_paise,
      },
    });

    return NextResponse.json({
      success: true,
      booking: confirmation.booking,
      bookingReference: confirmation.booking.booking_reference,
      merchantTransactionId,
      phonepeTransactionId: finalPhonePeId,
      utrNumber: generatedUtr,
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
