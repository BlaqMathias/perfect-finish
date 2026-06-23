'use client';
// components/admin/AdminOrders.jsx

import { useState, useEffect } from 'react';
import { PageHeader } from './AdminOverview';

const STATUSES = ['pending','confirmed','processing','dispatched','delivered','cancelled'];

const STATUS_COLORS = {
  pending:    { bg:'rgba(255,193,7,0.1)',   color:'#ffd54f' },
  confirmed:  { bg:'rgba(100,181,246,0.1)', color:'#64b5f6' },
  processing: { bg:'rgba(186,104,200,0.1)', color:'#ba68c8' },
  dispatched: { bg:'rgba(77,208,225,0.1)',  color:'#4dd0e1' },
  delivered:  { bg:'rgba(100,180,100,0.1)', color:'#81c784' },
  cancelled:  { bg:'rgba(255,80,80,0.1)',   color:'#e57373' },
};

export default function AdminOrders() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('all');
  const [detail,  setDetail]  = useState(null);
  const [msg,     setMsg]     = useState('');

  function flash(m) { setMsg(m); setTimeout(() => setMsg(''), 3000); }

  async function load() {
    setLoading(true);
    const r = await fetch('/api/admin/orders', { cache: 'no-store' });
    setOrders(await r.json());
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function updateStatus(order, status) {
    const r    = await fetch(`/api/admin/orders/${order.id}`, {
      method:'PUT', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ order_status: status }),
    });
    const data = await r.json();
    if (r.ok) {
      flash('Status updated.');
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, order_status: status } : o));
      if (detail?.id === order.id) setDetail(d => ({ ...d, order_status: status }));
    } else {
      flash('Error: ' + data.message);
    }
  }

  const visible = filter === 'all' ? orders : orders.filter(o => o.order_status === filter);

  return (
    <div>
      <PageHeader title="Orders" subtitle={`${orders.length} total order${orders.length !== 1 ? 's' : ''}`} />

      {msg && <div style={s.msg}>{msg}</div>}

      {/* Filter tabs */}
      <div style={s.filters}>
        {['all', ...STATUSES].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{ ...s.filterBtn, ...(filter === f ? s.filterActive : {}) }}
          >
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            <span style={s.filterCount}>
              {f === 'all' ? orders.length : orders.filter(o => o.order_status === f).length}
            </span>
          </button>
        ))}
      </div>

      {loading ? <p style={s.muted}>Loading…</p> : visible.length === 0 ? (
        <p style={s.muted}>No orders found.</p>
      ) : (
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>
                {['Reference','Customer','Fragrance','Size','Qty','Total','Status','Action'].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map(order => {
                const sc = STATUS_COLORS[order.order_status] || {};
                return (
                  <tr key={order.id} style={s.tr}>
                    <td style={{ ...s.td, ...s.ref }} onClick={() => setDetail(order)}>
                      {order.order_reference}
                    </td>
                    <td style={s.td}>
                      <div style={s.customerName}>{order.first_name} {order.last_name}</div>
                      <div style={s.customerPhone}>{order.phone}</div>
                    </td>
                    <td style={s.td}>{order.perfume_name}</td>
                    <td style={s.td}>{order.bottle_size}</td>
                    <td style={s.td}>{order.quantity}</td>
                    <td style={s.td}>
                      {order.total_amount > 0
                        ? '₦' + Number(order.total_amount).toLocaleString()
                        : <span style={s.muted}>—</span>}
                    </td>
                    <td style={s.td}>
                      <span style={{ ...s.statusBadge, background: sc.bg, color: sc.color }}>
                        {order.order_status}
                      </span>
                    </td>
                    <td style={s.td}>
                      <select
                        value={order.order_status}
                        onChange={e => updateStatus(order, e.target.value)}
                        style={s.select}
                      >
                        {STATUSES.map(st => (
                          <option key={st} value={st}>{st.charAt(0).toUpperCase() + st.slice(1)}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail panel */}
      {detail && (
        <div style={s.overlay} onClick={e => e.target === e.currentTarget && setDetail(null)}>
          <div style={s.panel}>
            <div style={s.panelHead}>
              <h3 style={s.panelTitle}>{detail.order_reference}</h3>
              <button onClick={() => setDetail(null)} style={s.closeBtn}>✕</button>
            </div>
            <div style={s.panelBody}>
              <Section label="Customer">
                <Row label="Name"    value={`${detail.first_name} ${detail.last_name}`} />
                <Row label="Phone"   value={detail.phone} />
                {detail.email   && <Row label="Email"   value={detail.email} />}
                <Row label="Address" value={detail.address} />
              </Section>
              <Section label="Order">
                <Row label="Fragrance" value={detail.perfume_name} />
                <Row label="Size"      value={detail.bottle_size} />
                <Row label="Quantity"  value={detail.quantity} />
                <Row label="Total"     value={detail.total_amount > 0 ? '₦' + Number(detail.total_amount).toLocaleString() : 'To be quoted'} />
                {detail.notes && <Row label="Notes" value={detail.notes} />}
              </Section>
              <Section label="Status">
                <select
                  value={detail.order_status}
                  onChange={e => updateStatus(detail, e.target.value)}
                  style={{ ...s.select, width:'100%', padding:'10px 14px' }}
                >
                  {STATUSES.map(st => (
                    <option key={st} value={st}>{st.charAt(0).toUpperCase() + st.slice(1)}</option>
                  ))}
                </select>
              </Section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ label, children }) {
  return (
    <div style={{ marginBottom:'24px' }}>
      <p style={{ fontSize:'0.65rem', letterSpacing:'0.18em', textTransform:'uppercase', color:'#7a7770', marginBottom:'12px' }}>{label}</p>
      {children}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display:'flex', gap:'12px', padding:'6px 0', borderBottom:'1px solid rgba(255,255,255,0.04)', fontSize:'0.83rem' }}>
      <span style={{ color:'#7a7770', minWidth:'80px' }}>{label}</span>
      <span style={{ color:'#f5f0e8', flex:1 }}>{value}</span>
    </div>
  );
}

const s = {
  msg:          { padding:'12px 18px', background:'rgba(201,168,76,0.1)', border:'1px solid rgba(201,168,76,0.25)', borderRadius:'6px', color:'#c9a84c', fontSize:'0.82rem', marginBottom:'20px' },
  muted:        { color:'#7a7770', fontSize:'0.85rem' },
  filters:      { display:'flex', flexWrap:'wrap', gap:'8px', marginBottom:'24px' },
  filterBtn:    { padding:'7px 14px', background:'#161410', border:'1px solid rgba(201,168,76,0.12)', borderRadius:'20px', color:'#7a7770', fontSize:'0.75rem', cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:'6px' },
  filterActive: { borderColor:'rgba(201,168,76,0.5)', color:'#c9a84c', background:'rgba(201,168,76,0.08)' },
  filterCount:  { background:'rgba(255,255,255,0.06)', borderRadius:'10px', padding:'1px 6px', fontSize:'0.7rem' },
  tableWrap:    { overflowX:'auto' },
  table:        { width:'100%', borderCollapse:'collapse', fontSize:'0.83rem' },
  th:           { padding:'10px 14px', textAlign:'left', fontSize:'0.65rem', letterSpacing:'0.12em', textTransform:'uppercase', color:'#7a7770', borderBottom:'1px solid rgba(201,168,76,0.1)', whiteSpace:'nowrap' },
  tr:           { borderBottom:'1px solid rgba(255,255,255,0.04)' },
  td:           { padding:'12px 14px', color:'#9e9a93', verticalAlign:'middle' },
  ref:          { color:'#c9a84c', fontFamily:'monospace', cursor:'pointer', textDecoration:'underline', textUnderlineOffset:'3px' },
  customerName: { color:'#f5f0e8', fontWeight:500 },
  customerPhone:{ color:'#7a7770', fontSize:'0.75rem', marginTop:'2px' },
  statusBadge:  { display:'inline-block', padding:'3px 10px', borderRadius:'20px', fontSize:'0.72rem' },
  select:       { background:'#0f0d09', border:'1px solid rgba(201,168,76,0.18)', borderRadius:'4px', color:'#9e9a93', fontSize:'0.78rem', padding:'5px 8px', fontFamily:'inherit', cursor:'pointer' },
  overlay:      { position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'flex-end' },
  panel:        { background:'#1a1712', borderLeft:'1px solid rgba(201,168,76,0.2)', width:'100%', maxWidth:'400px', height:'100vh', overflowY:'auto' },
  panelHead:    { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'24px 28px', borderBottom:'1px solid rgba(201,168,76,0.1)' },
  panelTitle:   { fontFamily:'"Cormorant Garamond",serif', fontSize:'1.3rem', fontWeight:400, color:'#c9a84c', fontStyle:'italic' },
  closeBtn:     { background:'none', border:'none', color:'#7a7770', fontSize:'1.1rem', cursor:'pointer' },
  panelBody:    { padding:'28px' },
};
