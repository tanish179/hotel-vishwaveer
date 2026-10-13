import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { formatINR } from '@/lib/pricing';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';

    if (format === 'json') {
      const backup = db.exportFullBackup();
      return new NextResponse(JSON.stringify(backup, null, 2), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="hotel_vishwaveer_backup_${Date.now()}.json"`,
        },
      });
    }

    // Default: CSV export
    const bookings = db.getAllBookings();

    const headers = [
      'Booking Reference',
      'Guest Name',
      'Guest Email',
      'Guest Phone',
      'Room Number',
      'Room Category',
      'Check In',
      'Check Out',
      'Nights',
      'Total Amount (INR)',
      'Advance Paid (INR)',
      'Balance Due (INR)',
      'Status',
      'Booked Date',
    ];

    const rows = bookings.map((b) => [
      b.booking_reference,
      `"${(b.guest?.full_name || '').replace(/"/g, '""')}"`,
      b.guest?.email || '',
      `"${b.guest?.phone || ''}"`,
      b.room?.room_number || '',
      `"${b.room_type?.name || ''}"`,
      b.check_in,
      b.check_out,
      b.nights,
      (b.total_amount_paise / 100).toFixed(2),
      (b.advance_paid_paise / 100).toFixed(2),
      (b.balance_amount_paise / 100).toFixed(2),
      b.status.toUpperCase(),
      b.created_at.split('T')[0],
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="hotel_vishwaveer_reservations_${Date.now()}.csv"`,
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
