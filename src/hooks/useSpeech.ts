import { useEffect, useRef } from 'react';
import { supabaseBrowser } from '@/services/supabase/client';

export function useSpeech(sessionId: string, userName: string, role: string, isMuted: boolean) {
  const recognitionRef = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech Recognition API not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognitionRef.current = recognition;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = async (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim();

      if (transcript && transcript.length > 2) {
        console.log(`🎤 Captured Speech: "${transcript}"`);

        await supabaseBrowser.from('transcript_segments').insert({
          session_id: sessionId,
          speaker_name: userName,
          speaker_role: role,
          text: transcript
        });
      }
    };

    recognition.onend = () => {
      if (!isMuted) recognition.start();
    };

    if (!isMuted) {
      try { recognition.start(); } catch {}
    } else {
      recognition.stop();
    }

    return () => recognition.stop();
  }, [sessionId, userName, role, isMuted]);

  return null;
}
