/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from 'react';
import { supabaseBrowser } from '@/services/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export function useParticipants(sessionId: string) {
  const [participants, setParticipants] = useState<any[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchParticipants() {
      const { data } = await supabaseBrowser
        .from('participants')
        .select('*')
        .eq('session_id', sessionId)
        .is('left_at', null);

      if (data && isMounted) setParticipants(data);
    }

    fetchParticipants();

    if (channelRef.current) return;

    const channel = supabaseBrowser
      .channel(`participants:${sessionId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'participants', filter: `session_id=eq.${sessionId}` },
        async (payload) => {
           if (!isMounted) return;

           if (payload.eventType === 'INSERT') {
             setParticipants(prev => [...prev, payload.new]);
           } else if (payload.eventType === 'UPDATE') {
             if (payload.new.left_at) {
                setParticipants(prev => prev.filter(p => p.id !== payload.new.id));
             } else {
                setParticipants(prev => prev.map(p => p.id === payload.new.id ? payload.new : p));
             }
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

  return { participants };
}
