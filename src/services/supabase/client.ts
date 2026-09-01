import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function requireBrowserConfig(): { url: string; key: string } {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
      'Copy .env.example to .env.local and fill in your Supabase credentials.'
    );
  }
  return { url: supabaseUrl, key: supabaseAnonKey };
}

let _browserClient: SupabaseClient | null = null;

/**
 * Anonymous browser client — no user context. Use for public reads only.
 * RLS policies that require a user identity will reject writes from this client.
 */
export const supabaseBrowser: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!_browserClient) {
      const { url, key } = requireBrowserConfig();
      _browserClient = createClient(url, key);
    }
    const value = (_browserClient as unknown as Record<string, unknown>)[prop as string];
    return typeof value === 'function' ? value.bind(_browserClient) : value;
  },
});

/**
 * Returns a browser client with the x-user-id header set on every request.
 * Required for RLS policies that check request.headers->>'x-user-id'.
 */
export function getSupabaseBrowser(userId: string): SupabaseClient {
  const { url, key } = requireBrowserConfig();
  return createClient(url, key, {
    global: { headers: { 'x-user-id': userId } },
  });
}
