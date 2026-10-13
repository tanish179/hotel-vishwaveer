import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createPhonePePayload, getPhonePeConfig } from '@/lib/phonepe';
import { isBefore, parseISO } from 'date-fns';

export async function POST(request: Request) {
  try {
    const { bookingId } = await request.json();

    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: 'Booking ID is required' },
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

    if (booking.status === 'confirmed') {
      return NextResponse.json(
        { success: false, error: 'Booking is already confirmed and paid.' },
        { status: 400 }
      );
    }

    // Check hold expiry
    if (booking.hold_expires_at && isBefore(parseISO(booking.hold_expires_at), new Date())) {
      booking.status = 'expired';
      return NextResponse.json(
        {
          success: false,
          error: 'Your 15-minute room hold has expired. Please restart the reservation.',
        },
        { status: 410 }
      );
    }

    const merchantTransactionId = `TXN_VWV_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 6)}`;
    const advanceAmountPaise = booking.advance_amount_paise;
    const origin =
      process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const phonePeData = createPhonePePayload({
      merchantTransactionId,
      amountPaise: advanceAmountPaise,
      merchantUserId: booking.guest_id,
      mobileNumber: booking.guest?.phone,
      redirectUrl: `${origin}/api/payment/phonepe/callback`,
      callbackUrl: `${origin}/api/payment/phonepe/callback`,
      bookingReference: booking.booking_reference,
    });

    return NextResponse.json({
      success: true,
      provider: 'phonepe',
      merchantTransactionId,
      amountPaise: advanceAmountPaise,
      bookingReference: booking.booking_reference,
      base64Payload: phonePeData.base64Payload,
      xVerify: phonePeData.xVerify,
      merchantId: phonePeData.merchantId,
      guest: {
        name: booking.guest?.full_name,
        email: booking.guest?.email,
        phone: booking.guest?.phone,
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
