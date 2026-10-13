import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { calculateAuthoritativePrice } from '@/lib/pricing';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');
    const guests = parseInt(searchParams.get('guests') || '1', 10);

    const roomTypes = db.getRoomTypes();
    const settings = db.getSettings();
    const allRooms = db.getAllPhysicalRooms();

    const results = roomTypes.map((type) => {
      // Find matching physical rooms
      const categoryRooms = allRooms.filter((r) => r.room_type_id === type.id);
      
      let availableRoomsCount = categoryRooms.length;
      let calculatedPricing = null;

      if (checkIn && checkOut) {
        try {
          calculatedPricing = calculateAuthoritativePrice({
            checkIn,
            checkOut,
            basePricePaise: type.base_price_paise,
            gstPercent: settings.gst_percent,
            advancePercent: settings.advance_payment_percent,
          });

          // Check how many individual physical rooms are available for these dates
          availableRoomsCount = categoryRooms.filter((r) =>
            db.isRoomAvailable({
              roomId: r.id,
              checkIn,
              checkOut,
            })
          ).length;
        } catch {
          // If invalid dates passed, default availableRoomsCount
        }
      }

      return {
        ...type,
        totalPhysicalRooms: categoryRooms.length,
        availableCount: availableRoomsCount,
        isSoldOut: availableRoomsCount === 0,
        meetsCapacity: type.max_guests >= guests,
        pricing: calculatedPricing,
      };
    });

    return NextResponse.json({
      success: true,
      rooms: results,
      totalRoomsCount: allRooms.length,
      settings: {
        currency: settings.currency,
        currency_symbol: settings.currency_symbol,
        advance_payment_percent: settings.advance_payment_percent,
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
