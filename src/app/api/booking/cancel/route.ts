import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { bookingId, reference, contact, reason } = await request.json();

    if (!bookingId && (!reference || !contact)) {
      return NextResponse.json(
        { success: false, error: 'Verification credentials required to process cancellation.' },
        { status: 400 }
      );
    }

    let booking = null;
    if (bookingId) {
      booking = db.getBookingById(bookingId);
    } else if (reference && contact) {
      booking = db.lookupBooking({ reference, contact });
    }

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Reservation record not found.' },
        { status: 404 }
      );
    }

    if (booking.status === 'checked_in' || booking.status === 'checked_out') {
      return NextResponse.json(
        { success: false, error: 'Cannot cancel an active or completed stay online. Please contact the front desk directly.' },
        { status: 400 }
      );
    }

    const cancelResult = db.cancelBooking({
      bookingId: booking.id,
      reason: reason || 'Guest requested cancellation online',
      cancelledBy: `guest_${booking.guest?.email || 'portal'}`,
    });

    return NextResponse.json({
      success: true,
      booking: cancelResult.booking,
      message: 'Reservation cancelled successfully in accordance with hotel policy.',
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
