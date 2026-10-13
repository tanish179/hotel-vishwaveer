import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createRazorpayOrder, getRazorpayCredentials } from '@/lib/razorpay';
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

    // Verify hold has not expired
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

    // Authoritative 30% advance amount from the verified database record
    const advanceAmountPaise = booking.advance_amount_paise;
    const { keyId } = getRazorpayCredentials();

    const order = await createRazorpayOrder({
      amountPaise: advanceAmountPaise,
      currency: 'INR',
      receipt: `rcpt_${booking.booking_reference.replace(/-/g, '_')}`,
      notes: {
        bookingId: booking.id,
        bookingReference: booking.booking_reference,
        roomNumber: booking.room?.room_number || '',
        hotelName: 'Hotel Vishwaveer',
      },
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amountPaise: advanceAmountPaise,
      currency: order.currency,
      keyId,
      bookingReference: booking.booking_reference,
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
