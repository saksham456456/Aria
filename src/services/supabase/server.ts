import { createClient } from '@supabase/supabase-js';
import { serverEnv } from '@/lib/env';

export const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
  serverEnv.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);
