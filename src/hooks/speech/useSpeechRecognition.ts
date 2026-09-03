'use client';

import { useEffect, useRef } from 'react';
import { getSupabaseBrowser } from '@/services/supabase/client';

export function useSpeechRecognition(
  sessionId:         string,
  participantId:     string | undefined,
  role:              string | undefined,
  name:              string | undefined,
  isMicEnabled:      boolean,
  appUserId:         string,
  onSpeakingChange?: (speaking: boolean) => void,
) {
  const recognitionRef  = useRef<SpeechRecognition | null>(null);
  const isMicEnabledRef = useRef(isMicEnabled);
  const onSpeakingChangeRef = useRef(onSpeakingChange);

  useEffect(() => { isMicEnabledRef.current = isMicEnabled; }, [isMicEnabled]);
  useEffect(() => { onSpeakingChangeRef.current = onSpeakingChange; }, [onSpeakingChange]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Ctor) {
      console.warn('[useSpeechRecognition] Web Speech API unavailable — Chrome recommended');
      return;
    }

    if (!isMicEnabled || !participantId) {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      return;
    }

    if (recognitionRef.current) return;

    const recognition = new Ctor();
    recognition.continuous     = true;
    recognition.interimResults = false;
    recognition.lang           = 'en-US';

    recognition.onstart = () => { onSpeakingChangeRef.current?.(true); };

    recognition.onresult = async (event: SpeechRecognitionEvent) => {
      const result = event.results[event.results.length - 1];
      if (!result.isFinal) return;
      const text = result[0].transcript.trim();
      if (!text) return;
      onSpeakingChangeRef.current?.(true);
      
      try {
        const res = await fetch('/api/transcripts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id:     sessionId,
            participant_id: participantId,
            speaker_role:   role || 'student',
            speaker_name:   name || 'User',
            text,
            start_time:     new Date().toISOString(),
            end_time:       new Date().toISOString(),
          }),
        });
        if (!res.ok) {
          console.error('[useSpeechRecognition] Failed to log transcript to DB:', await res.text());
        }
      } catch (err) {
        console.error('[useSpeechRecognition] Network error logging transcript:', err);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        console.warn('[useSpeechRecognition] error:', event.error);
      }
      onSpeakingChangeRef.current?.(false);
    };

    recognition.onend = () => {
      onSpeakingChangeRef.current?.(false);
      if (isMicEnabledRef.current && recognitionRef.current) {
        try { recognition.start(); } catch { /* already starting */ }
      }
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
    } catch {
      console.error('[useSpeechRecognition] failed to start recognition');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      onSpeakingChangeRef.current?.(false);
    };
  // Exclude onSpeakingChange from deps to avoid re-renders restarting the stream.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMicEnabled, participantId, sessionId, role, name, appUserId]);
}
