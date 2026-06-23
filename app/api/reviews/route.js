// app/api/reviews/route.js
// GET /api/reviews
// Returns approved reviews ordered by sort_order, then id.

import { supabase } from '@/lib/supabase';
import { jsonNoStore } from '@/lib/noStore';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('id, customer_name, customer_image, location, rating, review_text, approved, sort_order, created_at')
      .eq('approved', true)
      .order('sort_order', { ascending: true })
      .order('id', { ascending: true });

    if (error) throw error;

    const reviews = (data || []).map(r => {
      const parts = (r.customer_name || '').trim().split(/\s+/);
      const initials = parts.map(w => w[0]?.toUpperCase() || '').join('').slice(0, 2);
      return {
        ...r,
        id: Number(r.id),
        rating: Number(r.rating),
        initials,
      };
    });

    return jsonNoStore(reviews, { status: 200 });
  } catch (err) {
    console.error('[GET /api/reviews]', err.message);
    return jsonNoStore(
      { success: false, message: 'Could not load reviews. Please try again.' },
      { status: 500 }
    );
  }
}
