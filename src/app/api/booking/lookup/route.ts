import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { reference, contact } = await request.json();

    if (!reference || !contact) {
      return NextResponse.json(
        { success: false, error: 'Please provide both your booking reference and contact details.' },
        { status: 400 }
      );
    }

    const booking = db.lookupBooking({ reference, contact });

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          error:
            'No matching reservation found for the given reference and contact details. Please verify your reference number (e.g. VWV-2026-XXXX).',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      booking,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
