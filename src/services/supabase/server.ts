import { createClient } from '@supabase/supabase-js';
import { serverEnv } from '@/lib/env';

// Server-side only client with service role key to bypass RLS for now.
// For production, we should implement a proper auth setup.
export const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321', // Dummy fallback if env not set for local build
  serverEnv.SUPABASE_SERVICE_ROLE_KEY || "dummy_key"
);
