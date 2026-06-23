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
        <span style={s.loaderMark}>
          <img
            src="/images/logo.png"
            alt="Perfect Finish Logo"
            style={s.loaderLogo}
          />
        </span>
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
    minHeight: '100vh',
    background: '#0f0d09',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loaderMark: {
    width: '130px',
    height: '130px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'pulse 1.8s ease-in-out infinite',
  },

  loaderLogo: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    display: 'block',
  },
};