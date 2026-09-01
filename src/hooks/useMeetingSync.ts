import { useEffect, useState, useCallback } from 'react';
import { supabaseBrowser } from '@/services/supabase/client';
import { Participant, ChatMessage, TranscriptSegment, LearningGap } from '@/types/meeting';

export function useMeetingSync(sessionId: string, ) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [transcripts, setTranscripts] = useState<TranscriptSegment[]>([]);
  const [learningGaps, setLearningGaps] = useState<LearningGap[]>([]);

  useEffect(() => {
    if (!sessionId) return;

    const loadState = async () => {
      const [pRes, mRes, tRes, gRes] = await Promise.all([
        supabaseBrowser.from('participants').select('*').eq('session_id', sessionId),
        supabaseBrowser.from('messages').select('*').eq('session_id', sessionId).order('created_at', { ascending: true }),
        supabaseBrowser.from('transcript_segments').select('*').eq('session_id', sessionId).order('created_at', { ascending: true }),
        supabaseBrowser.from('learning_gaps').select('*').eq('session_id', sessionId)
      ]);

      if (pRes.data) setParticipants(pRes.data as Participant[]);
      if (mRes.data) setMessages(mRes.data as ChatMessage[]);
      if (tRes.data) setTranscripts(tRes.data as TranscriptSegment[]);
      if (gRes.data) setLearningGaps(gRes.data as LearningGap[]);
    };

    loadState();

    const channel = supabaseBrowser
      .channel(`meeting_sync_${sessionId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'participants', filter: `session_id=eq.${sessionId}` }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setParticipants((prev) => [...prev.filter((p) => p.id !== payload.new.id), payload.new as Participant]);
        } else if (payload.eventType === 'UPDATE') {
          setParticipants((prev) => prev.map((p) => (p.id === payload.new.id ? (payload.new as Participant) : p)));
        } else if (payload.eventType === 'DELETE') {
          setParticipants((prev) => prev.filter((p) => p.id !== payload.old.id));
        }
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `session_id=eq.${sessionId}` }, (payload) => {
        setMessages((prev) => [...prev, payload.new as ChatMessage]);
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'transcript_segments', filter: `session_id=eq.${sessionId}` }, (payload) => {
        setTranscripts((prev) => [...prev, payload.new as TranscriptSegment]);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'learning_gaps', filter: `session_id=eq.${sessionId}` }, (payload) => {
        if (payload.eventType === 'INSERT') setLearningGaps((prev) => [...prev, payload.new as LearningGap]);
        if (payload.eventType === 'UPDATE') setLearningGaps((prev) => prev.map((g) => (g.id === payload.new.id ? (payload.new as LearningGap) : g)));
      })
      .subscribe();

    return () => {
      supabaseBrowser.removeChannel(channel);
    };
  }, [sessionId]);

  const sendMessage = useCallback(async (text: string, senderName: string, role: string) => {
    await supabaseBrowser.from('messages').insert({
      session_id: sessionId,
      sender_name: senderName,
      role,
      text
    });
  }, [sessionId]);

  const addTranscript = useCallback(async (segment: Omit<TranscriptSegment, 'id' | 'session_id'>) => {
    await supabaseBrowser.from('transcript_segments').insert({
      ...segment,
      session_id: sessionId
    });
  }, [sessionId]);

  return {
    participants,
    messages,
    transcripts,
    learningGaps,
    sendMessage,
    addTranscript
  };
}
