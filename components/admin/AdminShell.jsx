'use client';
// components/admin/AdminShell.jsx
// Top-level client component: checks session, shows login or dashboard.

import { useState, useEffect } from 'react';
import AdminLogin     from './AdminLogin';
import AdminDashboard from './AdminDashboard';

export default function AdminShell() {
  const [status, setStatus] = useState('loading'); // 'loading' | 'auth' | 'unauth'

  useEffect(() => {
    fetch('/api/admin/session')
      .then(r => r.ok ? setStatus('auth') : setStatus('unauth'))
      .catch(() => setStatus('unauth'));
  }, []);

  if (status === 'loading') {
    return (
      <div style={s.loader}>
        <span style={s.loaderMark}>PF</span>
      </div>
    );
  }

  if (status === 'unauth') {
    return <AdminLogin onSuccess={() => setStatus('auth')} />;
  }

  return <AdminDashboard onLogout={() => setStatus('unauth')} />;
}

const s = {
  loader: {
    minHeight: '100vh', background: '#0f0d09',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  loaderMark: {
    fontFamily: '"Cormorant Garamond", serif',
    fontSize: '2.5rem', fontStyle: 'italic',
    color: '#c9a84c', letterSpacing: '0.15em',
    animation: 'pulse 1.8s ease-in-out infinite',
  },
};
