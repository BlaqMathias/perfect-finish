// app/api/admin/fragrances/[id]/route.js
// PUT    /api/admin/fragrances/[id]  — update fragrance
// DELETE /api/admin/fragrances/[id]  — delete fragrance

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
  if (body.perfume_name !== undefined) updates.perfume_name = body.perfume_name;
  if (body.category     !== undefined) updates.category     = body.category;
  if (body.description  !== undefined) updates.description  = body.description;
  if (body.image_url    !== undefined) updates.image_url    = body.image_url || null;
  if (body.price        !== undefined) updates.price        = Number(body.price);
  if (body.badge        !== undefined) updates.badge        = body.badge || null;
  if (body.available    !== undefined) updates.available    = Boolean(body.available);
  if (body.sort_order   !== undefined) updates.sort_order   = Number(body.sort_order);

  const { data, error } = await db
    .from('perfumes').update(updates).eq('id', id).select().single();

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return jsonNoStore(data);
}

export async function DELETE(request, { params }) {
  const deny = await guard(); if (deny) return deny;
  const db   = getAdminClient();
  const id   = Number(params.id);

  const { error } = await db.from('perfumes').delete().eq('id', id);
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return jsonNoStore({ success: true });
}
