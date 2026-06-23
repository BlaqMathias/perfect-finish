// app/api/admin/fragrances/route.js
// GET  /api/admin/fragrances  — all fragrances (including unavailable)
// POST /api/admin/fragrances  — create new fragrance

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
    .from('perfumes')
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
  const row  = {
    perfume_name: (body.perfume_name ?? '').trim(),
    category:     (body.category     ?? '').trim(),
    description:  (body.description  ?? '').trim(),
    image_url:    (body.image_url    ?? '').trim() || null,
    price:        Number(body.price) || 0,
    badge:        (body.badge        ?? '').trim() || null,
    available:    body.available !== false,
    sort_order:   Number(body.sort_order) || 0,
  };

  if (!row.perfume_name) {
    return NextResponse.json({ message: 'perfume_name is required.' }, { status: 422 });
  }

  const { data, error } = await db.from('perfumes').insert(row).select().single();
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return jsonNoStore(data, { status: 201 });
}
