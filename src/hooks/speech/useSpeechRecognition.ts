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
  // Ref mirrors state so onend callback never reads a stale closure value
  const isMicEnabledRef = useRef(isMicEnabled);
  useEffect(() => { isMicEnabledRef.current = isMicEnabled; }, [isMicEnabled]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Ctor) {
      console.warn('[useSpeechRecognition] Web Speech API unavailable — Chrome recommended');
      return;
    }

    if (!isMicEnabled || !participantId) {
      recognitionRef.current?.stop();
      recognitionRef.current = null;
      return;
    }

    if (recognitionRef.current) return; // already running

    const recognition = new Ctor();
    recognition.continuous     = true;
    recognition.interimResults = false;
    recognition.lang           = 'en-US';

    recognition.onstart = () => { onSpeakingChange?.(true); };

    recognition.onresult = async (event: SpeechRecognitionEvent) => {
      const result = event.results[event.results.length - 1];
      if (!result.isFinal) return;
      const text = result[0].transcript.trim();
      if (!text) return;
      onSpeakingChange?.(true);
      const supabase = getSupabaseBrowser(appUserId);
      await supabase.from('transcript_segments').insert({
        session_id:     sessionId,
        participant_id: participantId,
        speaker_role:   role,
        speaker_name:   name,
        text,
        start_time:     new Date().toISOString(),
        end_time:       new Date().toISOString(),
      });
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        console.warn('[useSpeechRecognition] error:', event.error);
      }
      onSpeakingChange?.(false);
    };

    // Use ref (not closure variable) so restart always sees the live value
    recognition.onend = () => {
      onSpeakingChange?.(false);
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
      recognitionRef.current?.stop();
      recognitionRef.current = null;
      onSpeakingChange?.(false);
    };
  }, [isMicEnabled, participantId, sessionId, role, name, appUserId, onSpeakingChange]);
}
