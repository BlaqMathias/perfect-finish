// app/api/admin/logout/route.js
// POST /api/admin/logout

import { NextResponse } from 'next/server';
import { COOKIE_NAME }  from '@/lib/adminAuth';

export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(COOKIE_NAME, '', { maxAge: 0, path: '/' });
  return res;
}
