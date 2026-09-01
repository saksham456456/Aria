import { useState, useEffect, useRef } from 'react';
import { AriaState, TranscriptSegment, Participant } from '@/types/meeting';
import AgoraRTC, { ILocalAudioTrack, IAgoraRTCClient } from 'agora-rtc-sdk-ng';
import { supabaseBrowser } from '@/services/supabase/client';

export function useAriaEngine(
  sessionId: string,
  lessonContext: Record<string, unknown>,
  transcripts: TranscriptSegment[],
  participants: Participant[],
  isTeacher: boolean,
  agoraClient: IAgoraRTCClient | null
) {
  const [ariaState, setAriaState] = useState<AriaState>({
    isListening: true,
    isEvaluating: false,
    isSpeaking: false,
    currentResponse: null,
    mode: 'collaborative',
    sensitivity: 'medium'
  });

  const lastEvaluatedIndexRef = useRef<number>(0);

  useEffect(() => {
    if (!isTeacher || ariaState.mode === 'paused' || ariaState.mode === 'silent_observer') return;
    if (transcripts.length === 0 || transcripts.length === lastEvaluatedIndexRef.current) return;

    const timer = setTimeout(async () => {
      lastEvaluatedIndexRef.current = transcripts.length;
      setAriaState((prev) => ({ ...prev, isEvaluating: true }));

      try {
        const res = await fetch('/api/aria', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lessonContext,
            recentTranscripts: transcripts.slice(-6),
            participants,
            ariaMode: ariaState.mode
          })
        });

        const decision = await res.json();

        if (decision.detectedGaps && decision.detectedGaps.length > 0) {
          const gapsToInsert = decision.detectedGaps.map((gap: { concept: string; description: string; confidence: number }) => ({
            session_id: sessionId,
            concept: gap.concept,
            description: gap.description,
            confidence: gap.confidence,
            affected_student_ids: []
          }));

          await supabaseBrowser.from('learning_gaps').insert(gapsToInsert);
        }

        if (decision.shouldSpeak && decision.response) {
          speak(decision.response, agoraClient);
        }
      } catch (err) {
        console.error('ARIA Evaluation Error:', err);
      } finally {
        setAriaState((prev) => ({ ...prev, isEvaluating: false }));
      }
    }, 2200);

    return () => clearTimeout(timer);
  }, [transcripts, ariaState.mode, isTeacher, lessonContext, participants, sessionId, agoraClient]);

  const speak = async (text: string, client: IAgoraRTCClient | null) => {
    setAriaState((prev) => ({ ...prev, isSpeaking: true, currentResponse: text }));

    let customAudioTrack: ILocalAudioTrack | null = null;

    try {
      const response = await fetch('/api/aria/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error('Failed to fetch TTS audio');

      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);

      const audioEl = new window.Audio(audioUrl);
      audioEl.crossOrigin = 'anonymous';

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const captureStream = (audioEl as any).captureStream || (audioEl as any).mozCaptureStream;

      if (captureStream && client) {
        const audioStream = captureStream.call(audioEl);
        const mediaStreamTrack = audioStream.getAudioTracks()[0];

        customAudioTrack = AgoraRTC.createCustomAudioTrack({
          mediaStreamTrack,
        });

        await client.publish([customAudioTrack]);
      }

      audioEl.onended = async () => {
        if (customAudioTrack && client) {
          await client.unpublish([customAudioTrack]);
          customAudioTrack.close();
        }
        URL.revokeObjectURL(audioUrl);
        setAriaState((prev) => ({ ...prev, isSpeaking: false, currentResponse: null }));
      };

      await audioEl.play();

    } catch (error) {
      console.error('Error broadcasting ARIA voice:', error);

      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => setAriaState((prev) => ({ ...prev, isSpeaking: false, currentResponse: null }));
        window.speechSynthesis.speak(utterance);
      } else {
        setAriaState((prev) => ({ ...prev, isSpeaking: false, currentResponse: null }));
      }
    }
  };

  const forceIntervene = () => {
    speak("Excuse me, teacher. I noticed several students might benefit from a quick visual breakdown of this step. Would you like me to walk through an example?", agoraClient);
  };

  const setMode = (mode: AriaState['mode']) => {
    if (mode === 'paused' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setAriaState((prev) => ({ ...prev, mode }));
  };

  return {
    ariaState,
    setMode,
    forceIntervene,
    speak
  };
}
