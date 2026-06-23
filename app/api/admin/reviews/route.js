// app/api/admin/reviews/route.js
// GET  /api/admin/reviews — all reviews
// POST /api/admin/reviews — create review

import { NextResponse }       from 'next/server';
import { jsonNoStore }        from '@/lib/noStore';
import { verifyAdminSession } from '@/lib/adminAuth';
import { getAdminClient }     from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

async function guard() {
  const ok = await verifyAdminSession();
  if (!ok) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  return null;
}

export async function GET() {
  const deny = await guard(); if (deny) return deny;
  const db = getAdminClient();

  const { data, error } = await db
    .from('reviews')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('id',         { ascending: true });

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return jsonNoStore(data ?? []);
}

export async function POST(request) {
  const deny = await guard(); if (deny) return deny;
  const db   = getAdminClient();
  const body = await request.json();

  const row = {
    customer_name:  (body.customer_name  ?? '').trim(),
    customer_image: (body.customer_image ?? '').trim() || null,
    location:       (body.location       ?? '').trim() || null,
    rating:         Number(body.rating)  || 5,
    review_text:    (body.review_text    ?? '').trim(),
    approved:       body.approved !== false,
    sort_order:     Number(body.sort_order) || 0,
  };

  if (!row.customer_name || !row.review_text) {
    return NextResponse.json(
      { message: 'customer_name and review_text are required.' },
      { status: 422 }
    );
  }

  const { data, error } = await db.from('reviews').insert(row).select().single();
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return jsonNoStore(data, { status: 201 });
}
