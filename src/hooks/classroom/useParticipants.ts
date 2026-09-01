import { useState, useEffect, useRef } from 'react';
import { getSupabaseBrowser } from '@/services/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { Participant } from '@/types/session';

export function useParticipants(sessionId: string, appUserId: string) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchParticipants() {
      const supabase = getSupabaseBrowser(appUserId);
      const { data } = await supabase
        .from('participants')
        .select('*')
        .eq('session_id', sessionId)
        .is('left_at', null);

      if (data && isMounted) setParticipants(data as Participant[]);
    }

    fetchParticipants();

    if (channelRef.current) return;

    const supabase = getSupabaseBrowser(appUserId);
    const channel = supabase
      .channel(`participants:${sessionId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'participants', filter: `session_id=eq.${sessionId}` },
        (payload) => {
          if (!isMounted) return;
          const p = payload.new as Participant;
          if (payload.eventType === 'INSERT') {
            setParticipants(prev => prev.some(x => x.id === p.id) ? prev : [...prev, p]);
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
      const supabase = getSupabaseBrowser(appUserId);
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [sessionId, appUserId]);

  return { participants };
}
