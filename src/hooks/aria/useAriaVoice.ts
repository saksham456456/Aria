/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { supabaseBrowser } from '@/services/supabase/client';

// Keep a module-level reference to the bot client to ensure singleton usage per session
let ariaBotClient: any = null;
let currentSessionId: string | null = null;

export function useAriaVoice(sessionId: string, appUserId: string) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clean up if session changes
  if (currentSessionId !== sessionId) {
      if (ariaBotClient) {
          ariaBotClient.leave();
          ariaBotClient = null;
      }
      currentSessionId = sessionId;
  }

  const initBotClient = useCallback(async () => {
    if (ariaBotClient) return ariaBotClient;

    const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
    if (!appId) throw new Error("Missing Agora App ID");

    // The bot needs to join as a unique UID
    // We generate a deterministic or random UID for the bot.
    const botUid = `bot_${appUserId.substring(0,8)}_${Date.now().toString().slice(-4)}`;

    // Fetch token for bot
    const res = await fetch(`/api/agora/token?channelName=${sessionId}&uid=${botUid}`);
    if (!res.ok) throw new Error("Failed to fetch bot token");
    const { token } = await res.json();

    const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    await client.join(appId, sessionId, token, botUid);
    ariaBotClient = client;
    return client;
  }, [sessionId, appUserId]);

  const speak = useCallback(async (text: string) => {
    if (isPlaying) return;
    setIsPlaying(true);
    setError(null);

    // Check fallback config
    // Note: since this runs in the browser, we check NEXT_PUBLIC prefix or simply if the api returns a fallback
    // The instructions say "if ElevenLabs is unavailable or not configured ... dev fallback: browser speechSynthesis"
    // So we try the API first, if it fails or returns a specific fallback code, we use local.
    // For this prototype, we'll hit the API and if it 500s due to no keys, we fallback.

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
        const json = await response.json().catch(() => ({}));
        if (json.error?.code === 'internal_error' && json.error?.message?.includes('ElevenLabs')) {
          // Dev fallback
          console.warn('[ARIA] Using browser TTS fallback — other participants cannot hear ARIA.');
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.onend = () => setIsPlaying(false);
          window.speechSynthesis.speak(utterance);
          return;
        } else {
           throw new Error(json.error?.message || 'TTS request failed');
        }
      }

      const audioBuffer = await response.arrayBuffer();

      // Decode and route through Web Audio
      const audioCtx = new AudioContext();
      const decoded = await audioCtx.decodeAudioData(audioBuffer);
      const destination = audioCtx.createMediaStreamDestination();
      const source = audioCtx.createBufferSource();
      source.buffer = decoded;
      source.connect(destination);

      // Create Agora custom track
      const ariaTrack = AgoraRTC.createCustomAudioTrack({
        mediaStreamTrack: destination.stream.getAudioTracks()[0],
      });

      const client = await initBotClient();
      await client.publish(ariaTrack);

      // Update state in DB
      await supabaseBrowser.from('aria_events').insert({
         session_id: sessionId,
         event_type: 'speech_started', // or similar tracking
      });

      // Also play locally for the teacher triggering it, as the bot client doesn't
      // automatically subscribe to its own audio. Actually, the teacher will hear
      // it from their own audioCtx if we connected to destination, but let's connect
      // to destination for Agora and also connect to audioCtx.destination for local playback.
      source.connect(audioCtx.destination);
      source.start();

      source.onended = async () => {
        try {
            await client.unpublish(ariaTrack);
        } catch (e) {
            console.error("Failed to unpublish bot track", e);
        }
        ariaTrack.close();
        audioCtx.close();
        setIsPlaying(false);
      };

    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : String(err));
      setIsPlaying(false);
    }
  }, [isPlaying, sessionId, appUserId, initBotClient]);

  return { speak, isPlaying, error };
}
