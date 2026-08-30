/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from 'react';
import { supabaseBrowser } from '@/services/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export function useSession(sessionId: string) {
  const [session, setSession] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchSession() {
      const { data, error } = await supabaseBrowser
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error && isMounted) setError(error.message);
      if (data && isMounted) setSession(data);
    }

    fetchSession();

    if (channelRef.current) return;

    const channel = supabaseBrowser
      .channel(`session_updates:${sessionId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'sessions', filter: `id=eq.${sessionId}` },
        (payload) => {
          if (isMounted) setSession(payload.new);
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      isMounted = false;
      supabaseBrowser.removeChannel(channel);
      channelRef.current = null;
    };
  }, [sessionId]);

  return { session, error };
}
