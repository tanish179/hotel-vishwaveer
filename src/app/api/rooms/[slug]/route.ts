import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { calculateAuthoritativePrice } from '@/lib/pricing';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const { searchParams } = new URL(request.url);
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');

    const roomType = db.getRoomTypeBySlug(slug);
    if (!roomType) {
      return NextResponse.json(
        { success: false, error: 'Room category not found' },
        { status: 404 }
      );
    }

    const settings = db.getSettings();
    const allRooms = db.getAllPhysicalRooms();
    const physicalRooms = allRooms.filter((r) => r.room_type_id === roomType.id);

    let calculatedPricing = null;
    let availableCount = physicalRooms.length;

    if (checkIn && checkOut) {
      try {
        calculatedPricing = calculateAuthoritativePrice({
          checkIn,
          checkOut,
          basePricePaise: roomType.base_price_paise,
          gstPercent: settings.gst_percent,
          advancePercent: settings.advance_payment_percent,
        });

        availableCount = physicalRooms.filter((r) =>
          db.isRoomAvailable({
            roomId: r.id,
            checkIn,
            checkOut,
          })
        ).length;
      } catch {
        // Date parse error ignored
      }
    }

    return NextResponse.json({
      success: true,
      room: {
        ...roomType,
        totalPhysicalRooms: physicalRooms.length,
        availableCount,
        isSoldOut: availableCount === 0,
        pricing: calculatedPricing,
      },
      settings,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
