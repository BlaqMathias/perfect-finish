'use client';
import { useState, useCallback } from 'react';

const SIZE_MULTIPLIERS = { '30ml': 1.0, '50ml': 1.5, '100ml': 2.2 };

const WA_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '2347084657676';

export default function OrderForm() {
  const [qty,          setQty]          = useState(1);
  const [size,         setSize]         = useState('30ml');
  const [fragranceVal, setFragranceVal] = useState('');
  const [submitting,   setSubmitting]   = useState(false);
  const [success,      setSuccess]      = useState(null); // order result object

  // Derived summary values
  const parts     = fragranceVal ? fragranceVal.split('|') : [];
  const sumName   = parts[1] || '—';
  const basePrice = parseFloat(parts[2]) || 0;
  const total     = Math.round(basePrice * SIZE_MULTIPLIERS[size] * qty);
  const sumTotal  = total > 0 ? `₦${total.toLocaleString()}` : 'To be quoted';

  const handleFragranceChange = useCallback((e) => {
    setFragranceVal(e.target.value);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!fragranceVal) {
      if (window.showToast) window.showToast('Please select a fragrance to continue.');
      document.getElementById('fragrance')?.focus();
      return;
    }

    const formData = new FormData(e.target);
    const payload  = {
      perfume_id:   parseInt(parts[0]) || null,
      perfume_name: parts[1] || '',
      bottle_size:  size,
      quantity:     qty,
      first_name:   formData.get('firstName')?.toString().trim(),
      last_name:    formData.get('lastName')?.toString().trim(),
      phone:        formData.get('phone')?.toString().trim(),
      email:        formData.get('email')?.toString().trim(),
      address:      formData.get('address')?.toString().trim(),
      notes:        formData.get('notes')?.toString().trim(),
    };

    setSubmitting(true);
    try {
      const res    = await fetch('/api/orders', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      const result = await res.json();

      if (result.success) {
        setSuccess(result);
        // Auto-open WhatsApp after short delay
        const waMsg = buildWaMessage(result);
        const waUrl = `https://wa.me/${result.wa_number || WA_NUMBER}?text=${encodeURIComponent(waMsg)}`;
        setTimeout(() => window.open(waUrl, '_blank'), 1200);
      } else {
        if (window.showToast) window.showToast(result.message || 'Something went wrong. Please try again.');
      }
    } catch {
      if (window.showToast) window.showToast('Connection error. Please check your internet and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function buildWaMessage(r) {
    const t = r.total_amount > 0 ? `₦${Number(r.total_amount).toLocaleString()}` : 'To be quoted';
    return [
      'Hello Perfect Finish! ✨',
      '',
      'New Order Received',
      `Reference: ${r.order_reference}`,
      '',
      `Fragrance : ${r.fragrance}`,
      `Size      : ${r.bottle_size}`,
      `Quantity  : ${r.quantity}`,
      `Total     : ${t}`,
      '',
      'Customer Details',
      `Name    : ${r.first_name} ${r.last_name}`,
      `Phone   : ${r.phone}`,
      `Address : ${r.address}`,
      r.notes ? `Notes   : ${r.notes}` : '',
    ].filter(Boolean).join('\n');
  }

  if (success) {
    const t      = success.total_amount > 0 ? `₦${Number(success.total_amount).toLocaleString()}` : 'To be quoted';
    const waMsg  = buildWaMessage(success);
    const waUrl  = `https://wa.me/${success.wa_number || WA_NUMBER}?text=${encodeURIComponent(waMsg)}`;
    return (
      <section id="order" className="order section">
        <div className="container">
          <div className="order-layout">
            <div className="order-form-wrap">
              <div className="order-success">
                <div className="success-icon">✦</div>
                <h3>Order Confirmed</h3>
                <p className="success-ref">Order Reference: <strong>{success.order_reference}</strong></p>
                <p>Thank you, <strong>{success.first_name}</strong>. Your order for <em>{success.fragrance}</em> has been received.</p>
                <p className="success-note">Our team will contact you on <strong>{success.phone}</strong> within a few hours to confirm payment and arrange delivery.</p>
                <div className="success-actions">
                  <a href={waUrl} target="_blank" rel="noopener" className="btn btn-wa">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                    Send Order via WhatsApp
                  </a>
                  <button onClick={() => window.location.reload()} className="btn btn-outline">Place Another Order</button>
                </div>
              </div>
            </div>
            <div className="order-summary" style={{ borderColor: 'rgba(201,168,76,0.5)' }}>
              <p className="summary-title">Order Summary</p>
              <div className="summary-row"><span>Fragrance</span><span>{success.fragrance}</span></div>
              <div className="summary-row"><span>Size</span><span>{success.bottle_size}</span></div>
              <div className="summary-row"><span>Quantity</span><span>{success.quantity}</span></div>
              <div className="summary-divider"></div>
              <div className="summary-row summary-total"><span>Total</span><span>{t}</span></div>
              <p className="summary-note">Payment confirmed after our team contacts you.</p>
              <div className="summary-brand">
                <div className="summary-logo">PF</div>
                <p>Perfect Finish<br /><em>Luxury Fragrances</em></p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="order" className="order section">
      <div className="container">
        <div className="section-header">
          <p className="section-eyebrow">Place Your Order</p>
          <h2 className="section-heading">Reserve Your <em>Fragrance</em></h2>
          <p className="section-sub">Fill in the details below. Our team will reach out to confirm and arrange delivery.</p>
        </div>

        <div className="order-layout">
          <div className="order-form-wrap">
            <form id="orderForm" className="order-form" onSubmit={handleSubmit}>

              <div className="form-group">
                <label className="form-label" htmlFor="fragrance">Fragrance Selection</label>
                <div className="select-wrap">
                  <select
                    id="fragrance"
                    name="fragrance"
                    className="form-control form-select"
                    value={fragranceVal}
                    onChange={handleFragranceChange}
                  >
                    <option value="">— Choose a fragrance —</option>
                    {/* Options injected by FeaturedFragrances after API load */}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Bottle Size</label>
                  <div className="size-selector">
                    {['30ml', '50ml', '100ml'].map(s => (
                      <button
                        key={s}
                        type="button"
                        className={`size-btn${size === s ? ' active' : ''}`}
                        data-size={s}
                        onClick={() => setSize(s)}
                      >{s}</button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Quantity</label>
                  <div className="qty-wrap">
                    <button type="button" className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                    <span className="qty-display">{qty}</span>
                    <button type="button" className="qty-btn" onClick={() => setQty(q => Math.min(20, q + 1))}>+</button>
                  </div>
                </div>
              </div>

              <div className="form-divider"></div>
              <p className="form-section-label">Your Details</p>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="firstName">First Name</label>
                  <input type="text" id="firstName" name="firstName" className="form-control" placeholder="Amara" required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="lastName">Last Name</label>
                  <input type="text" id="lastName" name="lastName" className="form-control" placeholder="Chukwu" required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="phone">Phone Number</label>
                  <input type="tel" id="phone" name="phone" className="form-control" placeholder="+234 800 000 0000" required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="email">Email Address</label>
                  <input type="email" id="email" name="email" className="form-control" placeholder="you@example.com" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="address">Delivery Address</label>
                <input type="text" id="address" name="address" className="form-control" placeholder="Street, City, State" required />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="notes">
                  Additional Notes <span className="label-opt">(optional)</span>
                </label>
                <textarea id="notes" name="notes" className="form-control form-textarea" placeholder="Occasion, preferences, gift message…" rows="3"></textarea>
              </div>

              <button type="submit" className="btn btn-gold btn-full" disabled={submitting}>
                <span>{submitting ? 'Processing…' : 'Confirm Order'}</span>
                {!submitting && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            </form>
          </div>

          <div className="order-summary" id="orderSummary">
            <p className="summary-title">Order Summary</p>
            <div className="summary-row"><span>Fragrance</span><span>{sumName}</span></div>
            <div className="summary-row"><span>Size</span><span>{size}</span></div>
            <div className="summary-row"><span>Quantity</span><span>{qty}</span></div>
            <div className="summary-divider"></div>
            <div className="summary-row summary-total"><span>Estimated Total</span><span>{sumTotal}</span></div>
            <p className="summary-note">Payment confirmed after our team contacts you.</p>
            <div className="summary-brand">
              <div className="summary-logo">PF</div>
              <p>Perfect Finish<br /><em>Luxury Fragrances</em></p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}