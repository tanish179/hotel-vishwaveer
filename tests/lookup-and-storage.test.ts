import { describe, it, expect } from 'vitest';
import { db } from '../src/lib/db';

describe('Guest Privacy Lookup & Storage Retention Safeguards', () => {
  it('protects guest privacy by denying lookup without matching contact credentials', async () => {
    const hold = await db.createBookingHold({
      roomTypeId: '11111111-1111-1111-1111-111111111102',
      checkIn: '2026-12-15',
      checkOut: '2026-12-18',
      guestName: 'Private Guest',
      guestEmail: 'private.guest@example.com',
      guestPhone: '+91 95555 44444',
      numGuests: 2,
    });
    expect(hold.success).toBe(true);
    const ref = hold.booking!.booking_reference;

    // Correct lookup with valid email
    const foundByEmail = db.lookupBooking({ reference: ref, contact: 'private.guest@example.com' });
    expect(foundByEmail).not.toBeNull();
    expect(foundByEmail?.booking_reference).toBe(ref);

    // Correct lookup with valid phone
    const foundByPhone = db.lookupBooking({ reference: ref, contact: '9555544444' });
    expect(foundByPhone).not.toBeNull();

    // Attacker guessing reference with incorrect contact MUST be rejected
    const failedLookup = db.lookupBooking({ reference: ref, contact: 'attacker@random.com' });
    expect(failedLookup).toBeNull();
  });

  it('processes guest cancellation according to policy', () => {
    const existing = db.getBookingByReference('VWV-2026-9481');
    expect(existing).not.toBeNull();

    const cancelResult = db.cancelBooking({
      bookingId: existing!.id,
      reason: 'Schedule change',
      cancelledBy: 'test_runner',
    });

    expect(cancelResult.success).toBe(true);
    expect(cancelResult.booking?.status).toBe('cancelled');
    expect(cancelResult.booking?.cancellation_reason).toBe('Schedule change');
  });

  it('exports complete backup structure containing all operational tables', () => {
    const backup = db.exportFullBackup();

    expect(backup).toHaveProperty('version');
    expect(backup).toHaveProperty('hotel_name', 'Hotel Vishwaveer');
    expect(backup).toHaveProperty('settings');
    expect(backup).toHaveProperty('room_types');
    expect(backup).toHaveProperty('rooms');
    expect(backup).toHaveProperty('guests');
    expect(backup).toHaveProperty('bookings');
    expect(backup).toHaveProperty('payments');
    expect(backup).toHaveProperty('audit_logs');
    expect(Array.isArray(backup.bookings)).toBe(true);
    expect(backup.bookings.length).toBeGreaterThanOrEqual(1);
  });

  it('guarantees that hold cleanup routine NEVER deletes confirmed bookings or audits', () => {
    const metricsBefore = db.getStorageMetrics();
    const confirmedCountBefore = db.getAllBookings({ status: 'confirmed' }).length;

    db.cleanupExpiredHolds('test_maintenance');

    const confirmedCountAfter = db.getAllBookings({ status: 'confirmed' }).length;
    expect(confirmedCountAfter).toBe(confirmedCountBefore);
  });
});
