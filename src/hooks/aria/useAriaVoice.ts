'use client';

import { useState, useCallback, useRef } from 'react';
import AgoraRTC, { IAgoraRTCClient } from 'agora-rtc-sdk-ng';

export type AriaVoiceState = 'idle' | 'fetching' | 'speaking' | 'error';

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
      const response = await fetch('/api/aria/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': appUserId,
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        if (response.status === 500) {
          console.warn(
            '[ARIA] ElevenLabs not configured. Falling back to browser SpeechSynthesis.'
          );
          if (!('speechSynthesis' in window)) {
            throw new Error('Neither ElevenLabs nor browser SpeechSynthesis is available');
          }
          const utterance = new SpeechSynthesisUtterance(text);
          setVoiceState('speaking');
          utterance.onend = () => {
            isPlayingRef.current = false;
            setVoiceState('idle');
          };
          utterance.onerror = () => {
            isPlayingRef.current = false;
            setVoiceState('idle');
          };
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(utterance);
          return;
        }
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson?.error?.message ?? `TTS request failed (${response.status})`);
      }

      const audioBuffer = await response.arrayBuffer();
      const audioCtx = new window.AudioContext();
      const decoded = await audioCtx.decodeAudioData(audioBuffer);

      const destination = audioCtx.createMediaStreamDestination();
      const source = audioCtx.createBufferSource();
      source.buffer = decoded;
      source.connect(destination);
      source.connect(audioCtx.destination);

      const ariaTrack = AgoraRTC.createCustomAudioTrack({
        mediaStreamTrack: destination.stream.getAudioTracks()[0],
      });

      setVoiceState('speaking');
      await agoraClient.publish(ariaTrack);
      source.start();

      source.onended = async () => {
        try {
          await agoraClient.unpublish(ariaTrack);
        } catch (e) {
          console.warn('[ARIA] unpublish custom track failed', e);
        }
        ariaTrack.close();
        await audioCtx.close();
        isPlayingRef.current = false;
        setVoiceState('idle');
      };

    } catch (err: unknown) {
      console.error('[ARIA] voice pipeline error', err);
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      isPlayingRef.current = false;
      setVoiceState('error');
    }
  }, [appUserId]);

  return {
    speak,
    voiceState,
    isSpeaking: voiceState === 'speaking',
    isFetching: voiceState === 'fetching',
    error,
  };
}
