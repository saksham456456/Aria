import { useState, useEffect, useRef, useCallback } from 'react';
import { getSupabaseBrowser } from '@/services/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { Message } from '@/types/session';

export function useChat(sessionId: string, appUserId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchMessages() {
      const supabase = getSupabaseBrowser(appUserId);
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })
        .limit(100);

      if (data && isMounted) setMessages(data as Message[]);
    }

    fetchMessages();

    if (channelRef.current) return;

    const supabase = getSupabaseBrowser(appUserId);
    const channel = supabase
      .channel(`chat:${sessionId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `session_id=eq.${sessionId}` },
        (payload) => {
          if (isMounted) setMessages(prev => [...prev, payload.new as Message]);
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

  const sendMessage = useCallback(async (
    participantId: string,
    role: string,
    senderName: string,
    text: string
  ) => {
    const supabase = getSupabaseBrowser(appUserId);
    const { error } = await supabase.from('messages').insert({
      session_id:     sessionId,
      participant_id: participantId,
      role,
      sender_name:    senderName,
      text,
    });
    if (error) console.error('[useChat] sendMessage failed', error);
  }, [sessionId, appUserId]);

  return { messages, sendMessage };
}
