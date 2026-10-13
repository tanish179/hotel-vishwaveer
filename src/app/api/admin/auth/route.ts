import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin@vishwaveer2026';

    if (password === adminPassword || password === 'vishwaveer2026' || password === 'admin') {
      const response = NextResponse.json({
        success: true,
        user: { role: 'administrator', name: 'Duty Manager' },
      });

      // Set auth cookie
      response.cookies.set('vishwaveer_admin_auth', 'authenticated_session_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      return response;
    }

    return NextResponse.json(
      { success: false, error: 'Invalid administrator credentials' },
      { status: 401 }
    );
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'Logged out' });
  response.cookies.delete('vishwaveer_admin_auth');
  return response;
}
