// app/api/orders/route.js
// POST /api/orders
// Validates, calculates server-side total, saves order, returns order reference.

import { NextResponse } from 'next/server';
import { supabase }     from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const SIZE_MULTIPLIERS = { '30ml': 1.0, '50ml': 1.5, '100ml': 2.2 };
const VALID_SIZES      = Object.keys(SIZE_MULTIPLIERS);

// ── helpers ──────────────────────────────────────────────────
function clean(val) {
  return typeof val === 'string' ? val.trim() : '';
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ── handler ──────────────────────────────────────────────────
export async function POST(request) {
  let body;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: 'Invalid request body.' },
      { status: 400 }
    );
  }

  // 1. Extract fields
  const perfumeId   = body.perfume_id   ? Number(body.perfume_id)   : null;
  const perfumeName = clean(body.perfume_name);
  const bottleSize  = clean(body.bottle_size)  || '30ml';
  const quantity    = Number(body.quantity)     || 1;
  const firstName   = clean(body.first_name);
  const lastName    = clean(body.last_name);
  const phone       = clean(body.phone);
  const email       = clean(body.email);
  const address     = clean(body.address);
  const notes       = clean(body.notes);

  // 2. Validate
  const errors = [];
  if (!perfumeName)                       errors.push('Please select a fragrance.');
  if (!VALID_SIZES.includes(bottleSize))  errors.push('Invalid bottle size selected.');
  if (quantity < 1 || quantity > 20)      errors.push('Quantity must be between 1 and 20.');
  if (!firstName)                         errors.push('First name is required.');
  if (!lastName)                          errors.push('Last name is required.');
  if (!phone)                             errors.push('Phone number is required.');
  if (!address)                           errors.push('Delivery address is required.');
  if (email && !isValidEmail(email))      errors.push('Please enter a valid email address.');

  if (errors.length > 0) {
    return NextResponse.json(
      { success: false, message: errors[0] },
      { status: 422 }
    );
  }

  try {
    // 3. Calculate total server-side — never trust the client price
    let totalAmount = 0;

    if (perfumeName !== 'Custom Blend' && perfumeId && perfumeId > 0) {
      const { data: perfume, error: perfumeError } = await supabase
        .from('perfumes')
        .select('price')
        .eq('id', perfumeId)
        .eq('available', true)
        .single();

      if (!perfumeError && perfume) {
        const multiplier = SIZE_MULTIPLIERS[bottleSize] ?? 1.0;
        totalAmount      = Math.round(Number(perfume.price) * multiplier * quantity * 100) / 100;
      }
      // If perfume not found → totalAmount stays 0 (will be quoted)
    }
    // Custom Blend → totalAmount stays 0

    // 4. Insert with a temporary reference, then update with real ID-based ref
    const { data: inserted, error: insertError } = await supabase
      .from('orders')
      .insert({
        order_reference: 'PF-TEMP',
        first_name:      firstName,
        last_name:       lastName,
        email:           email || null,
        phone,
        address,
        perfume_id:      perfumeId && perfumeId > 0 ? perfumeId : null,
        perfume_name:    perfumeName,
        bottle_size:     bottleSize,
        quantity,
        notes:           notes || null,
        total_amount:    totalAmount,
        order_status:    'pending',
      })
      .select('id')
      .single();

    if (insertError) throw insertError;

    const newId     = Number(inserted.id);
    const year      = new Date().getFullYear();
    const reference = `PF-${year}-${String(newId).padStart(5, '0')}`;

    // 5. Update with real reference
    const { error: updateError } = await supabase
      .from('orders')
      .update({ order_reference: reference })
      .eq('id', newId);

    if (updateError) throw updateError;

    // 6. Return success
    const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '2347084657676';

    return NextResponse.json({
      success:         true,
      order_reference: reference,
      first_name:      firstName,
      last_name:       lastName,
      fragrance:       perfumeName,
      bottle_size:     bottleSize,
      quantity,
      total_amount:    totalAmount,
      phone,
      address,
      notes,
      wa_number:       waNumber,
      message:         'Order submitted successfully',
    }, { status: 200 });

  } catch (err) {
    console.error('[POST /api/orders]', err.message);
    return NextResponse.json(
      {
        success: false,
        message: 'We could not process your order. Please try again or contact us on WhatsApp.',
      },
      { status: 500 }
    );
  }
}