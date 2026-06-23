// app/api/admin/login/route.js
// POST /api/admin/login

import { NextResponse }                          from 'next/server';
import { createSessionToken, getSessionCookieOptions } from '@/lib/adminAuth';

export async function POST(request) {
  try {
    const { password } = await request.json();
    const adminPass    = process.env.ADMIN_PASSWORD;

    if (!adminPass) {
      return NextResponse.json(
        { success: false, message: 'Admin password not configured.' },
        { status: 500 }
      );
    }

    if (!password || password !== adminPass) {
      return NextResponse.json(
        { success: false, message: 'Incorrect password.' },
        { status: 401 }
      );
    }

    const token  = createSessionToken();
    const opts   = getSessionCookieOptions();
    const res    = NextResponse.json({ success: true });

    res.cookies.set(opts.name, token, {
      httpOnly: opts.httpOnly,
      secure:   opts.secure,
      sameSite: opts.sameSite,
      maxAge:   opts.maxAge,
      path:     opts.path,
    });

    return res;
  } catch {
    return NextResponse.json(
      { success: false, message: 'Server error.' },
      { status: 500 }
    );
  }
}
