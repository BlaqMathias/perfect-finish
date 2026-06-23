// app/api/perfumes/route.js
// GET /api/perfumes
// Returns available perfumes ordered by sort_order, then id.

import { supabase } from '@/lib/supabase';
import { jsonNoStore } from '@/lib/noStore';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('perfumes')
      .select('id, perfume_name, category, description, image_url, price, badge, available, sort_order, updated_at')
      .eq('available', true)
      .order('sort_order', { ascending: true })
      .order('id', { ascending: true });

    if (error) throw error;

    const perfumes = (data || []).map(p => ({
      ...p,
      id: Number(p.id),
      price: Number(p.price),
    }));

    return jsonNoStore(perfumes, { status: 200 });
  } catch (err) {
    console.error('[GET /api/perfumes]', err.message);
    return jsonNoStore(
      { success: false, message: 'Could not load fragrances. Please try again.' },
      { status: 500 }
    );
  }
}
