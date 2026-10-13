import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const metricsBefore = db.getStorageMetrics();
    const removedCount = db.cleanupExpiredHolds('admin_cleanup_tool');
    const metricsAfter = db.getStorageMetrics();

    return NextResponse.json({
      success: true,
      removedExpiredHolds: removedCount,
      metrics: metricsAfter,
      message: `Safely removed ${removedCount} expired unreserved holds. Confirmed records remain preserved.`,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const metrics = db.getStorageMetrics();
    return NextResponse.json({ success: true, metrics });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
