import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const holdSchema = z.object({
  roomTypeId: z.string().min(1, 'Room category is required'),
  roomId: z.string().optional(),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid check-in date is required'),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid check-out date is required'),
  guestName: z.string().min(2, 'Guest name is required'),
  guestEmail: z.string().email('Valid email is required'),
  guestPhone: z.string().min(7, 'Valid contact phone number is required'),
  numGuests: z.number().int().min(1).default(2),
  specialRequests: z.string().optional(),
  estimatedArrivalTime: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const rawBody = await request.json();
    const validated = holdSchema.safeParse(rawBody);

    if (!validated.success) {
      const firstError = validated.error.errors[0]?.message || 'Invalid input data';
      return NextResponse.json({ success: false, error: firstError }, { status: 400 });
    }

    const {
      roomTypeId,
      roomId,
      checkIn,
      checkOut,
      guestName,
      guestEmail,
      guestPhone,
      numGuests,
      specialRequests,
      estimatedArrivalTime,
    } = validated.data;

    // Concurrency-safe atomic hold placement
    const result = await db.createBookingHold({
      roomTypeId,
      roomId,
      checkIn,
      checkOut,
      guestName,
      guestEmail,
      guestPhone,
      numGuests,
      specialRequests,
      estimatedArrivalTime,
    });

    if (!result.success || !result.booking) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to place room hold' },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      booking: result.booking,
      holdExpiresAt: result.booking.hold_expires_at,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
