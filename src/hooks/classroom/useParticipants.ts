import { useState, useEffect, useRef } from 'react';
import { supabaseBrowser } from '@/services/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { Participant } from '@/types/session';

export function useParticipants(sessionId: string) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchParticipants() {
      const { data } = await supabaseBrowser
        .from('participants')
        .select('*')
        .eq('session_id', sessionId)
        .is('left_at', null);

      if (data && isMounted) setParticipants(data as Participant[]);
    }

    fetchParticipants();

    if (channelRef.current) return;

    const channel = supabaseBrowser
      .channel(`participants:${sessionId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'participants', filter: `session_id=eq.${sessionId}` },
        (payload) => {
          if (!isMounted) return;
          const p = payload.new as Participant;
          if (payload.eventType === 'INSERT') {
            setParticipants(prev => [...prev, p]);
          } else if (payload.eventType === 'UPDATE') {
            if (p.left_at) {
              setParticipants(prev => prev.filter(x => x.id !== p.id));
            } else {
              setParticipants(prev => prev.map(x => x.id === p.id ? p : x));
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
