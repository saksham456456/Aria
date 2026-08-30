/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabaseBrowser } from '@/services/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export function useChat(sessionId: string) {
  const [messages, setMessages] = useState<any[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchMessages() {
      const { data } = await supabaseBrowser
        .from('messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })
        .limit(100);

      if (data && isMounted) setMessages(data);
    }

    fetchMessages();

    if (channelRef.current) return;

    const channel = supabaseBrowser
      .channel(`chat:${sessionId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `session_id=eq.${sessionId}` },
        (payload) => {
          if (isMounted) setMessages(prev => [...prev, payload.new]);
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

  const sendMessage = useCallback(async (participantId: string, role: string, senderName: string, text: string) => {
     await supabaseBrowser.from('messages').insert({
        session_id: sessionId,
        participant_id: participantId,
        role,
        sender_name: senderName,
        text
     });
  }, [sessionId]);

  return { messages, sendMessage };
}
