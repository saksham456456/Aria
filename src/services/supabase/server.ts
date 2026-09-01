import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getServerEnv } from '@/lib/env';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

/**
 * Server-side Supabase client using the service role key.
 * Bypasses RLS — use only in API route handlers, never in browser code.
 * Created lazily so Next.js build doesn't crash without env vars.
 */
let _serverClient: SupabaseClient | null = null;

export function getSupabaseServer(): SupabaseClient {
  if (!_serverClient) {
    if (!supabaseUrl) throw new Error('NEXT_PUBLIC_SUPABASE_URL is required');
    _serverClient = createClient(supabaseUrl, getServerEnv().SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return _serverClient;
}

/** Convenience alias matching existing import names. */
export const supabaseServer: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseServer();
    const value = (client as unknown as Record<string, unknown>)[prop as string];
    return typeof value === 'function' ? value.bind(client) : value;
  },
});
