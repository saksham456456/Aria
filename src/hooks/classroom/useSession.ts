import { useState, useEffect, useRef } from 'react';
import { supabaseBrowser } from '@/services/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { Session } from '@/types/session'; // Added typing instead of any

export function useSession(sessionId: string) {
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchSession() {
      const { data, error } = await supabaseBrowser
        .from('sessions')
        .select('*, classrooms(name, subject, topic, grade, lesson_description, join_code)')
        .eq('id', sessionId)
        .single();

      if (error && isMounted) setError(error.message);
      if (data && isMounted) setSession(data as unknown as Session);
    }

    fetchSession();

    if (channelRef.current) return;

    const channel = supabaseBrowser
      .channel(`session_updates:${sessionId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'sessions', filter: `id=eq.${sessionId}` },
        (payload) => {
          if (isMounted) {
            setSession((prev: Session | null) => {
              // Maintain classrooms relation which is not included in the payload
              return prev ? { ...prev, ...payload.new } : (payload.new as unknown as Session);
            });
          }
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
