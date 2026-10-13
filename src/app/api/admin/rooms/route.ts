import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const rooms = db.getAllPhysicalRooms();
    const roomTypes = db.getRoomTypes();
    return NextResponse.json({ success: true, rooms, roomTypes });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}

// Add new physical room or maintenance block
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'block') {
      const { roomId, startDate, endDate, reason } = body;
      const block = db.addRoomBlock({
        room_id: roomId,
        start_date: startDate,
        end_date: endDate,
        reason,
        status: 'active',
        created_by: 'admin',
      });
      return NextResponse.json({ success: true, block });
    }

    const { roomNumber, roomTypeId, floor, notes } = body;
    const room = db.addPhysicalRoom({
      room_number: roomNumber,
      room_type_id: roomTypeId,
      floor: floor || 1,
      notes,
    });

    return NextResponse.json({ success: true, room });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}

// Update room status
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { roomId, updates, actor = 'admin' } = body;

    const updated = db.updatePhysicalRoom(roomId, updates, actor);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Room not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, room: updated });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
