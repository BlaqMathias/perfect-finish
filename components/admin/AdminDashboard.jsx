'use client';
// components/admin/AdminDashboard.jsx
// Main shell with sidebar + tab routing.

import { useState } from 'react';
import AdminOverview    from './AdminOverview';
import AdminFragrances  from './AdminFragrances';
import AdminOrders      from './AdminOrders';
import AdminReviews     from './AdminReviews';

const TABS = [
  { id: 'overview',    label: 'Overview' },
  { id: 'fragrances',  label: 'Fragrances' },
  { id: 'orders',      label: 'Orders' },
  { id: 'reviews',     label: 'Reviews' },
];

export default function AdminDashboard({ onLogout }) {
  const [tab,         setTab]         = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    onLogout();
  }

  return (
    <div className="admin-root" style={s.root}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="admin-overlay" style={s.overlay} onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'is-open' : ''}`} style={{ ...s.sidebar, ...(sidebarOpen ? s.sidebarOpen : {}) }}>
        <div style={s.sidebarLogo}>
          <span style={s.logoMark}>
            <img
              src="/images/logo.png"
              alt="Perfect Finish Logo"
              style={s.logoImg}
            />
          </span>
          <span style={s.logoText}>Admin</span>
        </div>

        <nav style={s.nav}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setSidebarOpen(false); }}
              style={{ ...s.navBtn, ...(tab === t.id ? s.navBtnActive : {}) }}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div style={s.sidebarFooter}>
          <a href="/" target="_blank" style={s.siteLink}>← View Website</a>
          <button onClick={handleLogout} style={s.logoutBtn}>Log Out</button>
        </div>
      </aside>

      {/* Main content */}
      <main className="admin-main" style={s.main}>
        {/* Mobile header */}
        <div className="admin-mobile-header" style={s.mobileHeader}>
          <button onClick={() => setSidebarOpen(true)} style={s.menuBtn}>☰</button>
          <span style={s.mobileLogo}>
            <img
              src="/images/logo.png"
              alt="Perfect Finish Logo"
              style={s.mobileLogoImg}
            />
            <span>Admin</span>
          </span>
          <button onClick={handleLogout} style={s.mobileLogout}>Log Out</button>
        </div>

        <div className="admin-content" style={s.content}>
          {tab === 'overview'   && <AdminOverview />}
          {tab === 'fragrances' && <AdminFragrances />}
          {tab === 'orders'     && <AdminOrders />}
          {tab === 'reviews'    && <AdminReviews />}
        </div>
      </main>
    </div>
  );
}

const s = {
  root:         { display:'flex', minHeight:'100vh', background:'#0f0d09', fontFamily:'"Poppins",sans-serif' },
  overlay:      { position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:40 },
  sidebar:      { width:'220px', flexShrink:0, background:'#161410', borderRight:'1px solid rgba(201,168,76,0.12)', display:'flex', flexDirection:'column', padding:'0', position:'sticky', top:0, height:'100vh', zIndex:50, transition:'transform 0.3s' },
  sidebarOpen:  { '@media(max-width:768px)': { transform:'translateX(0)' } },
  sidebarLogo:  { padding:'32px 24px 24px', display:'flex', alignItems:'center', gap:'10px', borderBottom:'1px solid rgba(201,168,76,0.1)' },
    logoMark: {
    width: '38px',
    height: '38px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  logoImg: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    display: 'block',
  },

  logoText: {
    fontSize: '0.68rem',
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    color: '#7a7770',
    marginTop: '2px',
  },
  nav:          { flex:1, padding:'20px 12px', display:'flex', flexDirection:'column', gap:'4px' },
  navBtn:       { width:'100%', padding:'11px 14px', background:'transparent', border:'none', borderRadius:'6px', color:'#9e9a93', fontSize:'0.82rem', fontWeight:400, letterSpacing:'0.06em', cursor:'pointer', textAlign:'left', transition:'all 0.2s', fontFamily:'"Poppins",sans-serif' },
  navBtnActive: { background:'rgba(201,168,76,0.1)', color:'#c9a84c', fontWeight:500 },
  sidebarFooter:{ padding:'20px 16px', borderTop:'1px solid rgba(201,168,76,0.1)', display:'flex', flexDirection:'column', gap:'8px' },
  siteLink:     { fontSize:'0.72rem', color:'#7a7770', letterSpacing:'0.06em' },
  logoutBtn:    { padding:'9px', background:'transparent', border:'1px solid rgba(201,168,76,0.2)', borderRadius:'6px', color:'#9e9a93', fontSize:'0.75rem', cursor:'pointer', fontFamily:'"Poppins",sans-serif', letterSpacing:'0.08em' },
  main:         { flex:1, display:'flex', flexDirection:'column', minWidth:0 },
  mobileHeader: { display:'none', padding:'16px 20px', background:'#161410', borderBottom:'1px solid rgba(201,168,76,0.12)', alignItems:'center', justifyContent:'space-between' },
  menuBtn:      { background:'none', border:'none', color:'#c9a84c', fontSize:'1.3rem', cursor:'pointer' },
    mobileLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontFamily: '"Cormorant Garamond",serif',
    fontStyle: 'italic',
    color: '#c9a84c',
    fontSize: '1.1rem',
    letterSpacing: '0.1em',
  },

  mobileLogoImg: {
    width: '30px',
    height: '30px',
    objectFit: 'contain',
    display: 'block',
    flexShrink: 0,
  },
  mobileLogout: { background:'none', border:'1px solid rgba(201,168,76,0.2)', borderRadius:'4px', color:'#9e9a93', fontSize:'0.7rem', padding:'6px 10px', cursor:'pointer', fontFamily:'inherit' },
  content:      { padding:'40px', flex:1 },
};
