// lib/adminAuth.js
// Helpers for admin session cookie verification.
// All functions run server-side only.

import { cookies } from 'next/headers';
import { createHmac } from 'crypto';

const COOKIE_NAME = 'pf_admin_session';
const MAX_AGE     = 60 * 60 * 8; // 8 hours

function sign(payload) {
  const secret = process.env.ADMIN_SESSION_SECRET || 'changeme';
  const data   = JSON.stringify(payload);
  const sig    = createHmac('sha256', secret).update(data).digest('hex');
  return Buffer.from(JSON.stringify({ data, sig })).toString('base64');
}

function verify(token) {
  try {
    const secret  = process.env.ADMIN_SESSION_SECRET || 'changeme';
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
    const sig     = createHmac('sha256', secret).update(decoded.data).digest('hex');
    if (sig !== decoded.sig) return null;
    const payload = JSON.parse(decoded.data);
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export function createSessionToken() {
  return sign({ admin: true, exp: Date.now() + MAX_AGE * 1000 });
}

export function getSessionCookieOptions() {
  return {
    name:     COOKIE_NAME,
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   MAX_AGE,
    path:     '/',
  };
}

export async function verifyAdminSession() {
  const cookieStore = await cookies();
  const token       = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;
  const payload = verify(token);
  return !!payload?.admin;
}

export { COOKIE_NAME };
