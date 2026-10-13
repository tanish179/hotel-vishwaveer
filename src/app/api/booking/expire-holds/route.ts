import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST() {
  try {
    const expiredCount = db.expireStaleHolds();
    return NextResponse.json({
      success: true,
      expiredHoldsCleaned: expiredCount,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}
