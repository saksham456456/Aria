import { createClient } from '@supabase/supabase-js';
import { serverEnv } from '@/lib/env';

// Server-side only client with service role key to bypass RLS for now.
// For production, we should implement a proper auth setup.
export const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  serverEnv.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);
