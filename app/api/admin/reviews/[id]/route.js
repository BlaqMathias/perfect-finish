// app/api/admin/reviews/[id]/route.js
// PUT    /api/admin/reviews/[id]
// DELETE /api/admin/reviews/[id]

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

export async function PUT(request, { params }) {
  const deny = await guard(); if (deny) return deny;
  const db   = getAdminClient();
  const id   = Number(params.id);
  const body = await request.json();

  const updates = {};
  if (body.customer_name  !== undefined) updates.customer_name  = body.customer_name;
  if (body.customer_image !== undefined) updates.customer_image = body.customer_image || null;
  if (body.location       !== undefined) updates.location       = body.location || null;
  if (body.rating         !== undefined) updates.rating         = Number(body.rating);
  if (body.review_text    !== undefined) updates.review_text    = body.review_text;
  if (body.approved       !== undefined) updates.approved       = Boolean(body.approved);
  if (body.sort_order     !== undefined) updates.sort_order     = Number(body.sort_order);

  const { data, error } = await db
    .from('reviews').update(updates).eq('id', id).select().single();

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return jsonNoStore(data);
}

export async function DELETE(request, { params }) {
  const deny = await guard(); if (deny) return deny;
  const db   = getAdminClient();
  const id   = Number(params.id);

  const { error } = await db.from('reviews').delete().eq('id', id);
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return jsonNoStore({ success: true });
}
