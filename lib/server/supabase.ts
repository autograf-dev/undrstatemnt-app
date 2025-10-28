import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client using service role key
export function getSupabaseServiceClient() {
  // Support either SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL (URL is not secret)
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) or SUPABASE_SERVICE_ROLE_KEY');
  }
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
