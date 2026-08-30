'use client';

import { useState, useCallback, useRef } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { IAgoraRTCClient } from 'agora-rtc-sdk-ng';

type AriaVoiceState = 'idle' | 'fetching' | 'speaking' | 'error';

export function useAriaVoice(appUserId: string) {
  const [voiceState, setVoiceState] = useState<AriaVoiceState>('idle');
  const [error, setError] = useState<string | null>(null);
  const isPlayingRef = useRef(false);

  const speak = useCallback(async (
    text: string,
    agoraClient: IAgoraRTCClient
  ): Promise<void> => {
    if (isPlayingRef.current) return;
    isPlayingRef.current = true;
    setVoiceState('fetching');
    setError(null);

    try {
      // 1. Fetch TTS audio from ElevenLabs via server route
      const response = await fetch('/api/aria/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': appUserId,
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        // ElevenLabs not configured — dev fallback (local only, not shared via Agora)
        if (response.status === 500) {
          console.warn(
            '[ARIA] ElevenLabs not configured. Using browser TTS fallback.' +
            ' Other participants will NOT hear ARIA.'
          );
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.onend = () => {
            isPlayingRef.current = false;
            setVoiceState('idle');
          };
          window.speechSynthesis.speak(utterance);
          setVoiceState('speaking');
          return;
        }
        throw new Error(`TTS request failed: ${response.status}`);
      }

      // 2. Decode audio via Web Audio API
      const audioBuffer = await response.arrayBuffer();
      const audioCtx = new AudioContext();
      const decoded = await audioCtx.decodeAudioData(audioBuffer);

      // 3. Route through MediaStreamDestination → Agora custom track
      const destination = audioCtx.createMediaStreamDestination();
      const source = audioCtx.createBufferSource();
      source.buffer = decoded;
      source.connect(destination);         // → Agora (everyone hears it)
      source.connect(audioCtx.destination); // → local speaker (teacher also hears it)

      // 4. Create and publish Agora custom track from the existing client
      const ariaTrack = AgoraRTC.createCustomAudioTrack({
        mediaStreamTrack: destination.stream.getAudioTracks()[0],
      });

      setVoiceState('speaking');
      await agoraClient.publish(ariaTrack);
      source.start();

      // 5. Clean up when audio finishes
      source.onended = async () => {
        try {
          await agoraClient.unpublish(ariaTrack);
        } catch (e) {
          console.warn('[ARIA] unpublish failed', e);
        }
        ariaTrack.close();
        await audioCtx.close();
        isPlayingRef.current = false;
        setVoiceState('idle');
      };

    } catch (err: unknown) {
      console.error('[ARIA] voice error', err);
      setError(err instanceof Error ? err.message : String(err));
      isPlayingRef.current = false;
      setVoiceState('error');
    }
  }, [appUserId]);

  return {
    speak,
    voiceState,
    isSpeaking: voiceState === 'speaking',
    error,
  };
}
