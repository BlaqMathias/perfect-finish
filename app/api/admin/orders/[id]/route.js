// app/api/admin/orders/[id]/route.js
// PUT /api/admin/orders/[id] — update order status

import { NextResponse }       from 'next/server';
import { jsonNoStore }        from '@/lib/noStore';
import { verifyAdminSession } from '@/lib/adminAuth';
import { getAdminClient }     from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

const VALID_STATUSES = ['pending', 'confirmed', 'processing', 'dispatched', 'delivered', 'cancelled'];

export async function PUT(request, { params }) {
  const ok = await verifyAdminSession();
  if (!ok) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const db     = getAdminClient();
  const id     = Number(params.id);
  const body   = await request.json();
  const status = body.order_status;

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ message: 'Invalid order status.' }, { status: 422 });
  }

  const { data, error } = await db
    .from('orders').update({ order_status: status }).eq('id', id).select().single();

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return jsonNoStore(data);
}
