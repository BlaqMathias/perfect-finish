// app/api/reviews/route.js
// GET /api/reviews
// Returns approved reviews ordered by sort_order, then id.

import { NextResponse } from 'next/server';
import { supabase }     from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('id, customer_name, customer_image, location, rating, review_text')
      .eq('approved', true)
      .order('sort_order', { ascending: true })
      .order('id',         { ascending: true });

    if (error) throw error;

    const reviews = (data || []).map(r => {
      // Generate initials for avatar fallback
      const parts    = (r.customer_name || '').trim().split(/\s+/);
      const initials = parts.map(w => w[0]?.toUpperCase() || '').join('').slice(0, 2);

      return {
        ...r,
        id:       Number(r.id),
        rating:   Number(r.rating),
        initials,
      };
    });

    return NextResponse.json(reviews, { status: 200 });

  } catch (err) {
    console.error('[GET /api/reviews]', err.message);
    return NextResponse.json(
      { success: false, message: 'Could not load reviews. Please try again.' },
      { status: 500 }
    );
  }
}