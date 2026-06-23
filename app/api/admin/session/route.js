// app/api/admin/session/route.js
// GET /api/admin/session

import { NextResponse }        from 'next/server';
import { verifyAdminSession }  from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

export async function GET() {
  const valid = await verifyAdminSession();
  if (!valid) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true });
}
