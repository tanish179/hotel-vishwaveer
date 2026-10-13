import { describe, it, expect } from 'vitest';
import { db } from '../src/lib/db';

describe('Inventory Integrity & Concurrency Control', () => {
  const testRoomId = '22222222-2222-2222-2222-222222222103'; // Room 103
  const testRoomTypeId = '11111111-1111-1111-1111-111111111101'; // Deluxe Heritage

  it('correctly treats check-out date as exclusive for back-to-back stays', async () => {
    // Guest A reserves from 2026-11-01 to 2026-11-05
    const holdA = await db.createBookingHold({
      roomId: testRoomId,
      roomTypeId: testRoomTypeId,
      checkIn: '2026-11-01',
      checkOut: '2026-11-05',
      guestName: 'Guest Alpha',
      guestEmail: 'alpha@example.com',
      guestPhone: '+91 91111 11111',
      numGuests: 2,
    });
    expect(holdA.success).toBe(true);

    // Guest B can check in on 2026-11-05 (when Guest A checks out!)
    const isAvailableForB = db.isRoomAvailable({
      roomId: testRoomId,
      checkIn: '2026-11-05',
      checkOut: '2026-11-08',
    });
    expect(isAvailableForB).toBe(true);

    // But Guest C CANNOT book an overlapping range (e.g. 2026-11-03 to 2026-11-06)
    const isAvailableForC = db.isRoomAvailable({
      roomId: testRoomId,
      checkIn: '2026-11-03',
      checkOut: '2026-11-06',
    });
    expect(isAvailableForC).toBe(false);
  });

  it('prevents double-booking when two concurrent holds target the same physical room and dates', async () => {
    const targetRoomId = '22222222-2222-2222-2222-222222222301'; // Room 301
    const dates = {
      checkIn: '2026-12-01',
      checkOut: '2026-12-04',
    };

    // Simulate 2 guests simultaneously firing hold requests for the exact same room
    const [attempt1, attempt2] = await Promise.all([
      db.createBookingHold({
        roomId: targetRoomId,
        roomTypeId: '11111111-1111-1111-1111-111111111103',
        ...dates,
        guestName: 'Simultaneous Guest 1',
        guestEmail: 'sim1@example.com',
        guestPhone: '+91 98888 11111',
        numGuests: 2,
      }),
      db.createBookingHold({
        roomId: targetRoomId,
        roomTypeId: '11111111-1111-1111-1111-111111111103',
        ...dates,
        guestName: 'Simultaneous Guest 2',
        guestEmail: 'sim2@example.com',
        guestPhone: '+91 98888 22222',
        numGuests: 2,
      }),
    ]);

    // Exactly one must succeed, and the other must be rejected due to conflict
    const successCount = [attempt1.success, attempt2.success].filter(Boolean).length;
    const failCount = [attempt1.success, attempt2.success].filter((s) => !s).length;

    expect(successCount).toBe(1);
    expect(failCount).toBe(1);
  });

  it('releases inventory when temporary hold expires', async () => {
    const expireRoomId = '22222222-2222-2222-2222-222222222302'; // Room 302
    const hold = await db.createBookingHold({
      roomId: expireRoomId,
      roomTypeId: '11111111-1111-1111-1111-111111111103',
      checkIn: '2026-12-10',
      checkOut: '2026-12-12',
      guestName: 'Expiring Guest',
      guestEmail: 'exp@example.com',
      guestPhone: '+91 99999 88888',
      numGuests: 2,
    });
    expect(hold.success).toBe(true);

    const booking = hold.booking!;
    // Artificially expire the hold timestamp
    booking.hold_expires_at = new Date(Date.now() - 1000).toISOString();

    // Trigger sweeper
    const expiredCount = db.expireStaleHolds();
    expect(expiredCount).toBeGreaterThanOrEqual(1);

    // Verify room is now available again for those dates
    const isAvailableNow = db.isRoomAvailable({
      roomId: expireRoomId,
      checkIn: '2026-12-10',
      checkOut: '2026-12-12',
    });
    expect(isAvailableNow).toBe(true);
  });
});
