import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { BookingStatus, PaymentMethod } from '@/lib/types';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const booking = db.getBookingById(params.id);
    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, booking });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}

// Update status (check-in, check-out, cancel)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status, actor = 'front_desk' } = body;

    const result = db.updateBookingStatus(params.id, status as BookingStatus, actor);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, booking: result.booking });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}

// Record offline payment (guest pays remaining balance or extra via Cash/Card terminal/UPI)
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { amountPaise, paymentMethod = 'cash', notes, recordedBy = 'front_desk' } = body;

    if (!amountPaise || amountPaise <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment amount' },
        { status: 400 }
      );
    }

    const confirmation = db.confirmBookingPayment({
      bookingId: params.id,
      amountPaise,
      paymentMethod: paymentMethod as PaymentMethod,
      paymentType: 'balance_offline',
      recordedBy,
      razorpayPaymentId: `offline_${paymentMethod}_${Date.now()}`,
    });

    if (!confirmation.success) {
      return NextResponse.json({ success: false, error: confirmation.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, booking: confirmation.booking });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
