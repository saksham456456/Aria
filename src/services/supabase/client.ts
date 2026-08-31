import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy_anon_key';

// Global browser client (anon)
export const supabaseBrowser = createClient(supabaseUrl, supabaseKey);

// Factory function to attach x-user-id for RLS checks
export const getSupabaseBrowser = (userId: string) => {
  return createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        'x-user-id': userId
      }
    }
  });
};
