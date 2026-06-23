'use client';
// components/admin/AdminOverview.jsx

import { useState, useEffect } from 'react';

export default function AdminOverview() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/fragrances', { cache: 'no-store' }).then(r => r.json()),
      fetch('/api/admin/orders', { cache: 'no-store' }).then(r => r.json()),
      fetch('/api/admin/reviews', { cache: 'no-store' }).then(r => r.json()),
    ]).then(([fragrances, orders, reviews]) => {
      setStats({
        totalFragrances:     fragrances.length,
        availableFragrances: fragrances.filter(f => f.available).length,
        totalOrders:         orders.length,
        pendingOrders:       orders.filter(o => o.order_status === 'pending').length,
        deliveredOrders:     orders.filter(o => o.order_status === 'delivered').length,
        totalReviews:        reviews.length,
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <Skeleton />;

  const cards = [
    { label: 'Total Fragrances',     value: stats.totalFragrances,     gold: false },
    { label: 'Available Fragrances', value: stats.availableFragrances, gold: false },
    { label: 'Total Orders',         value: stats.totalOrders,         gold: true  },
    { label: 'Pending Orders',       value: stats.pendingOrders,       gold: false },
    { label: 'Delivered Orders',     value: stats.deliveredOrders,     gold: false },
    { label: 'Total Reviews',        value: stats.totalReviews,        gold: false },
  ];

  return (
    <div>
      <PageHeader title="Overview" subtitle="Live statistics from your database" />
      <div style={s.grid}>
        {cards.map(c => (
          <div key={c.label} style={{ ...s.card, ...(c.gold ? s.cardGold : {}) }}>
            <p style={s.cardValue}>{c.value}</p>
            <p style={s.cardLabel}>{c.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div>
      <PageHeader title="Overview" subtitle="Loading…" />
      <div style={s.grid}>
        {Array(6).fill(0).map((_, i) => (
          <div key={i} style={{ ...s.card, ...s.cardSkeleton }} />
        ))}
      </div>
    </div>
  );
}

export function PageHeader({ title, subtitle }) {
  return (
    <div style={s.header}>
      <h1 style={s.h1}>{title}</h1>
      {subtitle && <p style={s.sub}>{subtitle}</p>}
    </div>
  );
}

const s = {
  header:      { marginBottom:'36px' },
  h1:          { fontFamily:'"Cormorant Garamond",serif', fontSize:'2rem', fontWeight:400, color:'#f5f0e8', marginBottom:'4px' },
  sub:         { fontSize:'0.8rem', color:'#7a7770', letterSpacing:'0.06em' },
  grid:        { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:'20px' },
  card:        { background:'#161410', border:'1px solid rgba(201,168,76,0.14)', borderRadius:'10px', padding:'28px 24px' },
  cardGold:    { borderColor:'rgba(201,168,76,0.4)', background:'rgba(201,168,76,0.06)' },
  cardSkeleton:{ minHeight:'100px', background:'#1e1a13', borderColor:'transparent', animation:'shimmer 1.4s infinite' },
  cardValue:   { fontFamily:'"Cormorant Garamond",serif', fontSize:'2.6rem', fontWeight:400, color:'#c9a84c', lineHeight:1, marginBottom:'8px' },
  cardLabel:   { fontSize:'0.72rem', letterSpacing:'0.1em', textTransform:'uppercase', color:'#9e9a93' },
};
