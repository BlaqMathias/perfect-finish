// lib/supabase.js
// ─────────────────────────────────────────────────────────────
// Server-only Supabase client.
// Uses the SERVICE_ROLE key — NEVER import this in client components.
// All access happens inside app/api/* route handlers only.
// ─────────────────────────────────────────────────────────────

import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey   = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  throw new Error(
    'Missing Supabase environment variables.\n' +
    'Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local'
  );
}

// createClient is called once at module level — Next.js caches the module
// per-request in the Edge/Node runtime so this is safe.
export const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    // Service role client — disable all auth helpers
    persistSession:     false,
    autoRefreshToken:   false,
    detectSessionInUrl: false,
  },
});