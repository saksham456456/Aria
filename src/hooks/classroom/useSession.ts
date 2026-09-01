import { useState, useEffect, useRef } from 'react';
import { supabaseBrowser } from '@/services/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { Session } from '@/types/session';

export function useSession(sessionId: string) {
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchSession() {
      // Join classrooms so MeetingHeader can display the class name and topic
      const { data, error: fetchError } = await supabaseBrowser
        .from('sessions')
        .select('*, classrooms(name, subject, topic, grade, lesson_description, join_code)')
        .eq('id', sessionId)
        .single();

      if (fetchError && isMounted) setError(fetchError.message);
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
            // Merge updated fields while keeping the joined classrooms data
            setSession(prev => prev ? { ...prev, ...payload.new } as Session : null);
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
