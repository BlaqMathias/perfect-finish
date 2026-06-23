'use client';
// components/admin/AdminLogin.jsx

import { useState } from 'react';

export default function AdminLogin({ onSuccess }) {
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res  = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.success) {
        onSuccess();
      } else {
        setError(data.message || 'Incorrect password.');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <p style={s.mark}>PF</p>
        <h1 style={s.title}>Perfect Finish</h1>
        <p style={s.sub}>Admin Dashboard</p>

        <form onSubmit={handleSubmit} style={s.form}>
          <label style={s.label}>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter admin password"
            style={s.input}
            autoFocus
          />
          {error && <p style={s.error}>{error}</p>}
          <button type="submit" disabled={loading} style={s.btn}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

const s = {
  page:  { minHeight:'100vh', background:'#0f0d09', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px' },
  card:  { width:'100%', maxWidth:'380px', background:'#161410', border:'1px solid rgba(201,168,76,0.18)', borderRadius:'12px', padding:'48px 40px', textAlign:'center' },
  mark:  { fontFamily:'"Cormorant Garamond",serif', fontSize:'2.2rem', fontStyle:'italic', color:'#c9a84c', letterSpacing:'0.15em', marginBottom:'8px' },
  title: { fontFamily:'"Cormorant Garamond",serif', fontSize:'1.4rem', fontWeight:400, color:'#f5f0e8', marginBottom:'4px' },
  sub:   { fontSize:'0.7rem', letterSpacing:'0.22em', textTransform:'uppercase', color:'#7a7770', marginBottom:'36px' },
  form:  { display:'flex', flexDirection:'column', gap:'12px', textAlign:'left' },
  label: { fontSize:'0.72rem', letterSpacing:'0.12em', textTransform:'uppercase', color:'#9e9a93' },
  input: { padding:'12px 16px', background:'#1e1a13', border:'1px solid rgba(201,168,76,0.2)', borderRadius:'6px', color:'#f5f0e8', fontSize:'0.95rem', outline:'none', fontFamily:'inherit', width:'100%' },
  error: { fontSize:'0.8rem', color:'#e57373', margin:'0' },
  btn:   { marginTop:'8px', padding:'14px', background:'linear-gradient(135deg,#9a7730,#c9a84c)', border:'none', borderRadius:'6px', color:'#0f0d09', fontSize:'0.85rem', fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase', cursor:'pointer' },
};
