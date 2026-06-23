// app/api/perfumes/route.js
// GET /api/perfumes
// Returns available perfumes ordered by sort_order, then id.

import { NextResponse } from 'next/server';
import { supabase }     from '@/lib/supabase';

export const dynamic = 'force-dynamic'; // always fetch fresh, never cache

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('perfumes')
      .select('id, perfume_name, category, description, image_url, price, badge')
      .eq('available', true)
      .order('sort_order', { ascending: true })
      .order('id',         { ascending: true });

    if (error) throw error;

    // Normalise types
    const perfumes = (data || []).map(p => ({
      ...p,
      id:    Number(p.id),
      price: Number(p.price),
    }));

    return NextResponse.json(perfumes, { status: 200 });

  } catch (err) {
    console.error('[GET /api/perfumes]', err.message);
    return NextResponse.json(
      { success: false, message: 'Could not load fragrances. Please try again.' },
      { status: 500 }
    );
  }
}