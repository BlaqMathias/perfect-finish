'use client';
// components/admin/AdminReviews.jsx

import { useState, useEffect } from 'react';
import { PageHeader } from './AdminOverview';

const EMPTY = { customer_name:'', customer_image:'', location:'', rating:5, review_text:'', approved:true, sort_order:0 };

export default function AdminReviews() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [form,    setForm]    = useState(null);
  const [saving,  setSaving]  = useState(false);
  const [msg,     setMsg]     = useState('');

  function flash(m) { setMsg(m); setTimeout(() => setMsg(''), 3000); }

  async function load() {
    setLoading(true);
    const r = await fetch('/api/admin/reviews', { cache: 'no-store' });
    setItems(await r.json());
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function handleSave() {
    setSaving(true);
    const isNew = !form.id;
    const url   = isNew ? '/api/admin/reviews' : `/api/admin/reviews/${form.id}`;
    const r     = await fetch(url, {
      method: isNew ? 'POST' : 'PUT',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ ...form, rating: Number(form.rating), sort_order: Number(form.sort_order) }),
    });
    const data  = await r.json();
    setSaving(false);
    if (r.ok) { flash(isNew ? 'Review added.' : 'Review updated.'); setForm(null); load(); }
    else flash('Error: ' + (data.message || 'unknown'));
  }

  async function handleDelete(id) {
    if (!confirm('Delete this review?')) return;
    const r = await fetch(`/api/admin/reviews/${id}`, { method:'DELETE' });
    if (r.ok) { flash('Deleted.'); load(); }
    else flash('Delete failed.');
  }

  async function toggleApproved(item) {
    await fetch(`/api/admin/reviews/${item.id}`, {
      method:'PUT', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ approved: !item.approved }),
    });
    load();
  }

  function initials(name) {
    return (name || '').trim().split(/\s+/).map(w => w[0]?.toUpperCase() || '').join('').slice(0,2);
  }

  return (
    <div>
      <div style={s.row}>
        <PageHeader title="Reviews" subtitle={`${items.length} review${items.length !== 1 ? 's' : ''}`} />
        <button onClick={() => setForm({ ...EMPTY })} style={s.addBtn}>+ Add Review</button>
      </div>

      {msg && <div style={s.msg}>{msg}</div>}

      {loading ? <p style={s.muted}>Loading…</p> : (
        <div style={s.cards}>
          {items.map(item => (
            <div key={item.id} style={{ ...s.card, opacity: item.approved ? 1 : 0.55 }}>
              <div style={s.cardTop}>
                <div style={s.avatar}>
                  {item.customer_image
                    ? <img src={item.customer_image} alt={item.customer_name} style={s.avatarImg} />
                    : <span>{initials(item.customer_name)}</span>}
                </div>
                <div>
                  <p style={s.name}>{item.customer_name}</p>
                  <p style={s.location}>{item.location || '—'}</p>
                  <p style={s.stars}>{'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}</p>
                </div>
                <div style={s.cardActions}>
                  <button
                    onClick={() => toggleApproved(item)}
                    style={{ ...s.statusBtn, ...(item.approved ? s.approvedBtn : s.hiddenBtn) }}
                  >
                    {item.approved ? 'Approved' : 'Hidden'}
                  </button>
                </div>
              </div>
              <p style={s.reviewText}>{item.review_text}</p>
              <div style={s.footer}>
                <span style={s.meta}>Sort: {item.sort_order}</span>
                <div style={s.actionRow}>
                  <button onClick={() => setForm({ ...item })} style={s.editBtn}>Edit</button>
                  <button onClick={() => handleDelete(item.id)} style={s.delBtn}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {form && (
        <div style={s.overlay} onClick={e => e.target === e.currentTarget && setForm(null)}>
          <div style={s.modal}>
            <div style={s.modalHead}>
              <h2 style={s.modalTitle}>{form.id ? 'Edit Review' : 'Add Review'}</h2>
              <button onClick={() => setForm(null)} style={s.closeBtn}>✕</button>
            </div>
            <div style={s.formGrid}>
              <div style={s.field}>
                <label style={s.label}>Customer Name *</label>
                <input style={s.input} value={form.customer_name} onChange={e => setForm(f=>({...f,customer_name:e.target.value}))} />
              </div>
              <div style={s.field}>
                <label style={s.label}>Location</label>
                <input style={s.input} value={form.location} onChange={e => setForm(f=>({...f,location:e.target.value}))} />
              </div>
              <div style={s.field}>
                <label style={s.label}>Rating (1–5)</label>
                <select style={s.input} value={form.rating} onChange={e => setForm(f=>({...f,rating:Number(e.target.value)}))}>
                  {[5,4,3,2,1].map(n => <option key={n} value={n}>{'★'.repeat(n)} ({n})</option>)}
                </select>
              </div>
              <div style={s.field}>
                <label style={s.label}>Sort Order</label>
                <input type="number" style={s.input} value={form.sort_order} onChange={e => setForm(f=>({...f,sort_order:Number(e.target.value)}))} />
              </div>
              <div style={{ ...s.field, gridColumn:'1/-1' }}>
                <label style={s.label}>Customer Image URL (optional)</label>
                <input style={s.input} value={form.customer_image} onChange={e => setForm(f=>({...f,customer_image:e.target.value}))} placeholder="https://…" />
              </div>
              <div style={{ ...s.field, gridColumn:'1/-1' }}>
                <label style={s.label}>Review Text *</label>
                <textarea style={{ ...s.input, resize:'vertical' }} rows={4} value={form.review_text} onChange={e => setForm(f=>({...f,review_text:e.target.value}))} />
              </div>
              <div style={s.field}>
                <label style={s.toggle}>
                  <input type="checkbox" checked={form.approved} onChange={e => setForm(f=>({...f,approved:e.target.checked}))} />
                  <span style={{ marginLeft:'8px', color: form.approved ? '#c9a84c' : '#7a7770', fontSize:'0.83rem' }}>
                    {form.approved ? 'Approved — visible on site' : 'Hidden from site'}
                  </span>
                </label>
              </div>
            </div>
            <div style={s.modalFoot}>
              <button onClick={() => setForm(null)} style={s.cancelBtn}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={s.saveBtn}>
                {saving ? 'Saving…' : form.id ? 'Save Changes' : 'Add Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  row:         { display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:'16px', marginBottom:'0' },
  addBtn:      { padding:'11px 22px', background:'linear-gradient(135deg,#9a7730,#c9a84c)', border:'none', borderRadius:'6px', color:'#0f0d09', fontSize:'0.8rem', fontWeight:600, letterSpacing:'0.08em', cursor:'pointer', whiteSpace:'nowrap', alignSelf:'center' },
  msg:         { padding:'12px 18px', background:'rgba(201,168,76,0.1)', border:'1px solid rgba(201,168,76,0.25)', borderRadius:'6px', color:'#c9a84c', fontSize:'0.82rem', marginBottom:'20px' },
  muted:       { color:'#7a7770', fontSize:'0.85rem' },
  cards:       { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:'20px' },
  card:        { background:'#161410', border:'1px solid rgba(201,168,76,0.12)', borderRadius:'10px', padding:'24px' },
  cardTop:     { display:'flex', gap:'14px', alignItems:'flex-start', marginBottom:'14px' },
  avatar:      { width:'44px', height:'44px', borderRadius:'50%', background:'linear-gradient(135deg,#9a7730,#c9a84c)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.75rem', fontWeight:600, color:'#0f0d09', flexShrink:0, overflow:'hidden' },
  avatarImg:   { width:'100%', height:'100%', objectFit:'cover' },
  name:        { color:'#f5f0e8', fontWeight:500, fontSize:'0.9rem' },
  location:    { color:'#7a7770', fontSize:'0.75rem', marginTop:'2px' },
  stars:       { color:'#c9a84c', fontSize:'0.8rem', marginTop:'4px' },
  cardActions: { marginLeft:'auto' },
  statusBtn:   { padding:'4px 10px', borderRadius:'20px', fontSize:'0.7rem', border:'none', cursor:'pointer', fontFamily:'inherit' },
  approvedBtn: { background:'rgba(100,180,100,0.12)', color:'#81c784' },
  hiddenBtn:   { background:'rgba(255,100,100,0.1)', color:'#e57373' },
  reviewText:  { color:'#9e9a93', fontSize:'0.85rem', lineHeight:1.65, fontStyle:'italic', marginBottom:'16px' },
  footer:      { display:'flex', alignItems:'center', justifyContent:'space-between' },
  meta:        { fontSize:'0.72rem', color:'#7a7770' },
  actionRow:   { display:'flex', gap:'8px' },
  editBtn:     { padding:'5px 12px', background:'rgba(201,168,76,0.1)', border:'1px solid rgba(201,168,76,0.2)', borderRadius:'4px', color:'#c9a84c', fontSize:'0.75rem', cursor:'pointer', fontFamily:'inherit' },
  delBtn:      { padding:'5px 12px', background:'rgba(255,80,80,0.08)', border:'1px solid rgba(255,80,80,0.2)', borderRadius:'4px', color:'#e57373', fontSize:'0.75rem', cursor:'pointer', fontFamily:'inherit' },
  overlay:     { position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' },
  modal:       { background:'#1a1712', border:'1px solid rgba(201,168,76,0.2)', borderRadius:'12px', width:'100%', maxWidth:'520px', maxHeight:'90vh', overflowY:'auto' },
  modalHead:   { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'24px 28px', borderBottom:'1px solid rgba(201,168,76,0.1)' },
  modalTitle:  { fontFamily:'"Cormorant Garamond",serif', fontSize:'1.5rem', fontWeight:400, color:'#f5f0e8' },
  closeBtn:    { background:'none', border:'none', color:'#7a7770', fontSize:'1.1rem', cursor:'pointer' },
  formGrid:    { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'18px', padding:'24px 28px' },
  field:       { display:'flex', flexDirection:'column', gap:'6px' },
  label:       { fontSize:'0.7rem', letterSpacing:'0.12em', textTransform:'uppercase', color:'#7a7770' },
  input:       { padding:'10px 14px', background:'#0f0d09', border:'1px solid rgba(201,168,76,0.18)', borderRadius:'6px', color:'#f5f0e8', fontSize:'0.88rem', outline:'none', fontFamily:'inherit', width:'100%' },
  toggle:      { display:'flex', alignItems:'center', cursor:'pointer', marginTop:'6px' },
  modalFoot:   { display:'flex', gap:'12px', justifyContent:'flex-end', padding:'20px 28px', borderTop:'1px solid rgba(201,168,76,0.1)' },
  cancelBtn:   { padding:'10px 22px', background:'transparent', border:'1px solid rgba(201,168,76,0.2)', borderRadius:'6px', color:'#9e9a93', fontSize:'0.8rem', cursor:'pointer', fontFamily:'inherit' },
  saveBtn:     { padding:'10px 24px', background:'linear-gradient(135deg,#9a7730,#c9a84c)', border:'none', borderRadius:'6px', color:'#0f0d09', fontSize:'0.8rem', fontWeight:600, cursor:'pointer', fontFamily:'inherit' },
};
