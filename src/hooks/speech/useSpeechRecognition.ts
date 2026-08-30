import { useEffect, useRef } from 'react';
import { supabaseBrowser } from '@/services/supabase/client';

export function useSpeechRecognition(
  sessionId: string,
  participantId: string | undefined,
  role: string | undefined,
  name: string | undefined,
  isMicEnabled: boolean,
  onTeacherSpeaking?: (speaking: boolean) => void
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const isMicEnabledRef = useRef(isMicEnabled);
  const speakingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    isMicEnabledRef.current = isMicEnabled;
  }, [isMicEnabled]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
       if (onTeacherSpeaking && role === 'teacher') {
         onTeacherSpeaking(false);
       }
       return;
    }

    if (recognitionRef.current) return; // Already running

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true; // Need interim for speech detection
    recognition.lang = 'en-US'; // Default, could be configurable

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = async (event: any) => {
      const result = event.results[event.results.length - 1];

      // Notify speaking state
      if (onTeacherSpeaking && role === 'teacher') {
        onTeacherSpeaking(true);
        if (speakingTimeoutRef.current) clearTimeout(speakingTimeoutRef.current);
        speakingTimeoutRef.current = setTimeout(() => {
          onTeacherSpeaking(false);
        }, 1500); // Stop speaking if no result for 1.5s
      }

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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
    };

    recognition.onend = () => {
      // Auto-restart if mic is still enabled
      if (isMicEnabledRef.current && recognitionRef.current) {
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
      if (speakingTimeoutRef.current) clearTimeout(speakingTimeoutRef.current);
    };
  }, [isMicEnabled, participantId, sessionId, role, name, onTeacherSpeaking]);
}
