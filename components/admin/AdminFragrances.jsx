'use client';
// components/admin/AdminFragrances.jsx

import { useState, useEffect, useRef } from 'react';
import { PageHeader } from './AdminOverview';

const EMPTY = { perfume_name:'', category:'', description:'', image_url:'', price:'', badge:'', available:true, sort_order:0 };

export default function AdminFragrances() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [form,    setForm]    = useState(null);   // null=closed, {}=new, {id,...}=edit
  const [saving,  setSaving]  = useState(false);
  const [msg,     setMsg]     = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  function flash(m) { setMsg(m); setTimeout(() => setMsg(''), 3500); }

  async function load() {
    setLoading(true);
    const r = await fetch('/api/admin/fragrances', { cache: 'no-store' });
    setItems(await r.json());
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    const r    = await fetch('/api/admin/upload', { method:'POST', body:fd });
    const data = await r.json();
    setUploading(false);
    if (data.url) {
      setForm(f => ({ ...f, image_url: data.url }));
      flash('Image uploaded.');
    } else {
      flash('Upload failed: ' + (data.message || 'unknown error'));
    }
  }

  async function handleSave() {
    setSaving(true);
    const isNew = !form.id;
    const url   = isNew ? '/api/admin/fragrances' : `/api/admin/fragrances/${form.id}`;
    const r     = await fetch(url, {
      method: isNew ? 'POST' : 'PUT',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ ...form, price: Number(form.price), sort_order: Number(form.sort_order) }),
    });
    const data  = await r.json();
    setSaving(false);
    if (r.ok) { flash(isNew ? 'Fragrance added.' : 'Fragrance updated.'); setForm(null); load(); }
    else       flash('Error: ' + (data.message || 'unknown'));
  }

  async function handleDelete(id) {
    if (!confirm('Delete this fragrance?')) return;
    const r = await fetch(`/api/admin/fragrances/${id}`, { method:'DELETE' });
    if (r.ok) { flash('Deleted.'); load(); }
    else flash('Delete failed.');
  }

  async function toggleAvailable(item) {
    await fetch(`/api/admin/fragrances/${item.id}`, {
      method:'PUT', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ available: !item.available }),
    });
    load();
  }

  return (
    <div>
      <div style={s.row}>
        <PageHeader title="Fragrances" subtitle={`${items.length} fragrance${items.length !== 1 ? 's' : ''}`} />
        <button onClick={() => setForm({ ...EMPTY })} style={s.addBtn}>+ Add Fragrance</button>
      </div>

      {msg && <div style={s.msg}>{msg}</div>}

      {loading ? <p style={s.muted}>Loading…</p> : (
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>
                {['Image','Name','Category','Price','Badge','Status','Actions'].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} style={s.tr}>
                  <td style={s.td}>
                    {item.image_url
                      ? <img src={item.image_url} alt={item.perfume_name} style={s.thumb} />
                      : <div style={s.noImg}>—</div>}
                  </td>
                  <td style={{ ...s.td, ...s.bold }}>{item.perfume_name}</td>
                  <td style={s.td}><span style={s.chip}>{item.category}</span></td>
                  <td style={s.td}>₦{Number(item.price).toLocaleString()}</td>
                  <td style={s.td}>{item.badge || <span style={s.muted}>—</span>}</td>
                  <td style={s.td}>
                    <button onClick={() => toggleAvailable(item)}
                      style={{ ...s.status, ...(item.available ? s.statusOn : s.statusOff) }}>
                      {item.available ? 'Visible' : 'Hidden'}
                    </button>
                  </td>
                  <td style={s.td}>
                    <div style={s.actions}>
                      <button onClick={() => setForm({ ...item })} style={s.editBtn}>Edit</button>
                      <button onClick={() => handleDelete(item.id)} style={s.delBtn}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Form modal */}
      {form && (
        <div style={s.modalOverlay} onClick={e => e.target === e.currentTarget && setForm(null)}>
          <div style={s.modal}>
            <div style={s.modalHead}>
              <h2 style={s.modalTitle}>{form.id ? 'Edit Fragrance' : 'Add Fragrance'}</h2>
              <button onClick={() => setForm(null)} style={s.closeBtn}>✕</button>
            </div>

            <div style={s.formGrid}>
              {[
                ['perfume_name','Name *','text'],
                ['category','Category','text'],
                ['price','Price (₦) *','number'],
                ['badge','Badge (optional)','text'],
                ['sort_order','Sort Order','number'],
              ].map(([field, label, type]) => (
                <div key={field} style={s.fieldWrap}>
                  <label style={s.label}>{label}</label>
                  <input
                    type={type}
                    value={form[field] ?? ''}
                    onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                    style={s.input}
                  />
                </div>
              ))}

              <div style={{ ...s.fieldWrap, gridColumn:'1/-1' }}>
                <label style={s.label}>Description</label>
                <textarea
                  value={form.description ?? ''}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3} style={{ ...s.input, resize:'vertical' }}
                />
              </div>

              <div style={{ ...s.fieldWrap, gridColumn:'1/-1' }}>
                <label style={s.label}>Image URL</label>
                <input
                  type="text"
                  value={form.image_url ?? ''}
                  onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
                  placeholder="https://… or upload below"
                  style={s.input}
                />
                <div style={{ marginTop:'8px', display:'flex', alignItems:'center', gap:'12px' }}>
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} style={{ display:'none' }} />
                  <button onClick={() => fileRef.current?.click()} style={s.uploadBtn} disabled={uploading}>
                    {uploading ? 'Uploading…' : '↑ Upload Image'}
                  </button>
                  {form.image_url && (
                    <img src={form.image_url} alt="preview" style={s.preview} />
                  )}
                </div>
              </div>

              <div style={s.fieldWrap}>
                <label style={s.label}>Visibility</label>
                <label style={s.toggle}>
                  <input
                    type="checkbox"
                    checked={form.available}
                    onChange={e => setForm(f => ({ ...f, available: e.target.checked }))}
                  />
                  <span style={{ marginLeft:'8px', color: form.available ? '#c9a84c' : '#7a7770' }}>
                    {form.available ? 'Visible on website' : 'Hidden from website'}
                  </span>
                </label>
              </div>
            </div>

            <div style={s.modalFoot}>
              <button onClick={() => setForm(null)} style={s.cancelBtn}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={s.saveBtn}>
                {saving ? 'Saving…' : form.id ? 'Save Changes' : 'Add Fragrance'}
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
  tableWrap:   { overflowX:'auto' },
  table:       { width:'100%', borderCollapse:'collapse', fontSize:'0.83rem' },
  th:          { padding:'10px 14px', textAlign:'left', fontSize:'0.68rem', letterSpacing:'0.12em', textTransform:'uppercase', color:'#7a7770', borderBottom:'1px solid rgba(201,168,76,0.1)', whiteSpace:'nowrap' },
  tr:          { borderBottom:'1px solid rgba(255,255,255,0.04)' },
  td:          { padding:'12px 14px', color:'#9e9a93', verticalAlign:'middle' },
  bold:        { color:'#f5f0e8', fontWeight:500 },
  thumb:       { width:'44px', height:'44px', objectFit:'cover', borderRadius:'6px', border:'1px solid rgba(201,168,76,0.15)' },
  noImg:       { width:'44px', height:'44px', background:'#1e1a13', borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center', color:'#7a7770' },
  chip:        { padding:'3px 10px', background:'rgba(201,168,76,0.08)', border:'1px solid rgba(201,168,76,0.15)', borderRadius:'20px', fontSize:'0.72rem', color:'#c9a84c', whiteSpace:'nowrap' },
  status:      { padding:'4px 12px', borderRadius:'20px', fontSize:'0.72rem', border:'none', cursor:'pointer', fontFamily:'inherit' },
  statusOn:    { background:'rgba(100,180,100,0.12)', color:'#81c784' },
  statusOff:   { background:'rgba(255,100,100,0.1)', color:'#e57373' },
  actions:     { display:'flex', gap:'8px' },
  editBtn:     { padding:'5px 12px', background:'rgba(201,168,76,0.1)', border:'1px solid rgba(201,168,76,0.2)', borderRadius:'4px', color:'#c9a84c', fontSize:'0.75rem', cursor:'pointer', fontFamily:'inherit' },
  delBtn:      { padding:'5px 12px', background:'rgba(255,80,80,0.08)', border:'1px solid rgba(255,80,80,0.2)', borderRadius:'4px', color:'#e57373', fontSize:'0.75rem', cursor:'pointer', fontFamily:'inherit' },
  // Modal
  modalOverlay:{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' },
  modal:       { background:'#1a1712', border:'1px solid rgba(201,168,76,0.2)', borderRadius:'12px', width:'100%', maxWidth:'580px', maxHeight:'90vh', overflowY:'auto' },
  modalHead:   { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'24px 28px', borderBottom:'1px solid rgba(201,168,76,0.1)' },
  modalTitle:  { fontFamily:'"Cormorant Garamond",serif', fontSize:'1.5rem', fontWeight:400, color:'#f5f0e8' },
  closeBtn:    { background:'none', border:'none', color:'#7a7770', fontSize:'1.1rem', cursor:'pointer' },
  formGrid:    { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'18px', padding:'24px 28px' },
  fieldWrap:   { display:'flex', flexDirection:'column', gap:'6px' },
  label:       { fontSize:'0.7rem', letterSpacing:'0.12em', textTransform:'uppercase', color:'#7a7770' },
  input:       { padding:'10px 14px', background:'#0f0d09', border:'1px solid rgba(201,168,76,0.18)', borderRadius:'6px', color:'#f5f0e8', fontSize:'0.88rem', outline:'none', fontFamily:'inherit', width:'100%' },
  toggle:      { display:'flex', alignItems:'center', fontSize:'0.82rem', cursor:'pointer' },
  uploadBtn:   { padding:'8px 16px', background:'rgba(201,168,76,0.1)', border:'1px solid rgba(201,168,76,0.2)', borderRadius:'5px', color:'#c9a84c', fontSize:'0.78rem', cursor:'pointer', fontFamily:'inherit' },
  preview:     { width:'48px', height:'48px', objectFit:'cover', borderRadius:'6px', border:'1px solid rgba(201,168,76,0.2)' },
  modalFoot:   { display:'flex', gap:'12px', justifyContent:'flex-end', padding:'20px 28px', borderTop:'1px solid rgba(201,168,76,0.1)' },
  cancelBtn:   { padding:'10px 22px', background:'transparent', border:'1px solid rgba(201,168,76,0.2)', borderRadius:'6px', color:'#9e9a93', fontSize:'0.8rem', cursor:'pointer', fontFamily:'inherit' },
  saveBtn:     { padding:'10px 24px', background:'linear-gradient(135deg,#9a7730,#c9a84c)', border:'none', borderRadius:'6px', color:'#0f0d09', fontSize:'0.8rem', fontWeight:600, cursor:'pointer', fontFamily:'inherit' },
};
