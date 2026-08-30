/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from 'react';
import { supabaseBrowser } from '@/services/supabase/client';

export function useSpeechRecognition(
  sessionId: string,
  participantId: string | undefined,
  role: string | undefined,
  name: string | undefined,
  isMicEnabled: boolean
) {
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check for browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech Recognition API not supported in this browser.');
      return;
    }

    if (!isMicEnabled || !participantId) {
       if (recognitionRef.current) {
          recognitionRef.current.stop();
          recognitionRef.current = null;
       }
       return;
    }

    if (recognitionRef.current) return; // Already running

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false; // We only want final results
    recognition.lang = 'en-US'; // Default, could be configurable

    recognition.onresult = async (event: any) => {
      const result = event.results[event.results.length - 1];
      if (result.isFinal) {
        const text = result[0].transcript.trim();
        if (text) {
           await supabaseBrowser.from('transcript_segments').insert({
              session_id: sessionId,
              participant_id: participantId,
              speaker_role: role,
              speaker_name: name,
              text: text,
              start_time: new Date().toISOString(), // approximation
              end_time: new Date().toISOString(),
           });
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
    };

    recognition.onend = () => {
      // Auto-restart if mic is still enabled
      if (isMicEnabled && recognitionRef.current) {
         try {
           recognition.start();
         } catch {
           // ignore already started errors
         }
      }
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
    } catch {
      console.error("Failed to start speech recognition");
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, [isMicEnabled, participantId, sessionId, role, name]);
}
