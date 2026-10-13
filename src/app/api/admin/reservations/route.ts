import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { BookingStatus } from '@/lib/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || undefined;
    const status = (searchParams.get('status') as BookingStatus | 'all') || 'all';

    const bookings = db.getAllBookings({ query, status });
    return NextResponse.json({ success: true, bookings, count: bookings.length });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}

// Walk-in / Front Desk manual reservation creation
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      roomId,
      roomTypeId,
      checkIn,
      checkOut,
      guestName,
      guestEmail,
      guestPhone,
      numGuests,
      specialRequests,
      paymentMethod,
      advanceCollected, // boolean
    } = body;

    const holdResult = await db.createBookingHold({
      roomId,
      roomTypeId,
      checkIn,
      checkOut,
      guestName,
      guestEmail,
      guestPhone,
      numGuests: numGuests || 2,
      specialRequests,
      estimatedArrivalTime: 'Front Desk Walk-in',
    });

    if (!holdResult.success || !holdResult.booking) {
      return NextResponse.json(
        { success: false, error: holdResult.error || 'Failed to allocate room' },
        { status: 409 }
      );
    }

    const booking = holdResult.booking;

    // If advance or full payment collected at desk
    if (advanceCollected) {
      db.confirmBookingPayment({
        bookingId: booking.id,
        amountPaise: booking.advance_amount_paise,
        paymentMethod: paymentMethod || 'cash',
        paymentType: 'advance_online',
        recordedBy: 'front_desk_staff',
        razorpayPaymentId: `offline_desk_${Date.now()}`,
      });
    }

    return NextResponse.json({
      success: true,
      booking: db.getBookingById(booking.id),
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
