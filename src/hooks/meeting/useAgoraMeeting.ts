'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import AgoraRTC, {
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
  IAgoraRTCRemoteUser,
  ILocalVideoTrack,
} from 'agora-rtc-sdk-ng';
import { getAgoraClient, resetAgoraClient } from '@/services/agora/agoraClient';
import { fetchAgoraToken } from '@/services/agora/tokenService';
import { AgoraUser, ConnectionState } from '@/types/agora';

export function useAgoraMeeting(sessionId: string, appUserId: string) {
  const [connectionState, setConnectionState] = useState<ConnectionState>('idle');
  const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null);
  const [localVideoTrack, setLocalVideoTrack] = useState<ICameraVideoTrack | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<Record<string, AgoraUser>>({});
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs for tracks — never put tracks in useEffect deps (causes close-on-rerender)
  const localAudioRef = useRef<IMicrophoneAudioTrack | null>(null);
  const localVideoRef = useRef<ICameraVideoTrack | null>(null);
  const screenTrackRef = useRef<ILocalVideoTrack | null>(null);
  // useRef (not a closure variable) so it persists across re-renders
  const subscribedRef = useRef<Set<string>>(new Set());
  const initRef = useRef(false);

  const joinMeeting = useCallback(async () => {
    if (initRef.current) return;
    initRef.current = true;

    try {
      setConnectionState('joining');
      const client = getAgoraClient();
      const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
      if (!appId) throw new Error('NEXT_PUBLIC_AGORA_APP_ID is not configured');

      const token = await fetchAgoraToken(sessionId, appUserId);

      // ── Remote user events ──────────────────────────────────────────────

      client.on('user-published', async (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
        const key = `${user.uid}:${mediaType}`;
        if (subscribedRef.current.has(key)) return;
        subscribedRef.current.add(key);

        await client.subscribe(user, mediaType);

        if (mediaType === 'audio') {
          // Play audio immediately — no DOM element needed for audio tracks
          user.audioTrack?.play();
        }

        const uid = String(user.uid);
        setRemoteUsers(prev => {
          const existing = prev[uid] ?? { uid, hasAudio: false, hasVideo: false };
          return {
            ...prev,
            [uid]: {
              ...existing,
              audioTrack: mediaType === 'audio' ? user.audioTrack : existing.audioTrack,
              videoTrack: mediaType === 'video' ? user.videoTrack : existing.videoTrack,
              hasAudio: mediaType === 'audio' ? true : existing.hasAudio,
              hasVideo: mediaType === 'video' ? true : existing.hasVideo,
            },
          };
        });
      });

      client.on('user-unpublished', (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
        subscribedRef.current.delete(`${user.uid}:${mediaType}`);
        const uid = String(user.uid);
        setRemoteUsers(prev => {
          if (!prev[uid]) return prev;
          return {
            ...prev,
            [uid]: {
              ...prev[uid],
              audioTrack: mediaType === 'audio' ? undefined : prev[uid].audioTrack,
              videoTrack: mediaType === 'video' ? undefined : prev[uid].videoTrack,
              hasAudio: mediaType === 'audio' ? false : prev[uid].hasAudio,
              hasVideo: mediaType === 'video' ? false : prev[uid].hasVideo,
            },
          };
        });
      });

      client.on('user-left', (user: IAgoraRTCRemoteUser) => {
        const uid = String(user.uid);
        subscribedRef.current.delete(`${uid}:audio`);
        subscribedRef.current.delete(`${uid}:video`);
        setRemoteUsers(prev => {
          const next = { ...prev };
          delete next[uid];
          return next;
        });
      });

      client.on('connection-state-change', (curState) => {
        const stateMap: Record<string, ConnectionState> = {
          DISCONNECTED:  'disconnected',
          CONNECTING:    'connecting',
          CONNECTED:     'connected',
          RECONNECTING:  'reconnecting',
          DISCONNECTING: 'disconnecting',
        };
        setConnectionState(stateMap[curState] ?? 'error');
      });

      // ── Join + publish ──────────────────────────────────────────────────

      setConnectionState('connecting');
      await client.join(appId, sessionId, token, appUserId);

      const [audio, video] = await AgoraRTC.createMicrophoneAndCameraTracks(
        {},
        { encoderConfig: '360p_7' }
      );

      // Store in refs so cleanup doesn't go stale
      localAudioRef.current = audio;
      localVideoRef.current = video;

      // Store in state so VideoTile can render the feed
      setLocalAudioTrack(audio);
      setLocalVideoTrack(video);

      await client.publish([audio, video]);
      setConnectionState('connected');

    } catch (err: unknown) {
      console.error('[AGORA] joinMeeting failed', err);
      setError(err instanceof Error ? err.message : String(err));
      setConnectionState('error');
      initRef.current = false; // allow retry
    }
  }, [sessionId, appUserId]);

  // Single effect — tracks are NOT in deps (that would close them on every render)
  useEffect(() => {
    joinMeeting();

    return () => {
      const client = getAgoraClient();
      client.removeAllListeners();
      // Use refs, not state, so we always close the actual live tracks
      localAudioRef.current?.close();
      localVideoRef.current?.close();
      screenTrackRef.current?.close();
      client.leave().catch(err => console.warn('[AGORA] leave error during cleanup', err));
      resetAgoraClient();
    };
  }, [joinMeeting]);

  // ── Controls ────────────────────────────────────────────────────────────

  const toggleMic = useCallback(async () => {
    const track = localAudioRef.current;
    if (!track) return;
    const next = !isMicEnabled;
    await track.setEnabled(next);
    setIsMicEnabled(next);
  }, [isMicEnabled]);

  const toggleCamera = useCallback(async () => {
    const track = localVideoRef.current;
    if (!track) return;
    const next = !isCameraEnabled;
    await track.setEnabled(next);
    setIsCameraEnabled(next);
  }, [isCameraEnabled]);

  const startScreenShare = useCallback(async () => {
    const client = getAgoraClient();
    try {
      const screenTrack = await AgoraRTC.createScreenVideoTrack({}, 'disable') as ILocalVideoTrack;

      // When the browser's "Stop sharing" button is clicked
      screenTrack.on('track-ended', async () => {
        try { await client.unpublish(screenTrack); } catch {}
        screenTrack.close();
        if (localVideoRef.current) {
          await client.publish(localVideoRef.current);
        }
        screenTrackRef.current = null;
        setIsScreenSharing(false);
      });

      if (localVideoRef.current) {
        await client.unpublish(localVideoRef.current);
      }
      await client.publish(screenTrack);
      screenTrackRef.current = screenTrack;
      setIsScreenSharing(true);
    } catch (err) {
      // User cancelled the permission dialog — not an error worth surfacing
      console.warn('[AGORA] screen share cancelled or denied', err);
    }
  }, []);

  const stopScreenShare = useCallback(async () => {
    const client = getAgoraClient();
    if (screenTrackRef.current) {
      try { await client.unpublish(screenTrackRef.current); } catch {}
      screenTrackRef.current.close();
      screenTrackRef.current = null;
    }
    if (localVideoRef.current) {
      await client.publish(localVideoRef.current);
    }
    setIsScreenSharing(false);
  }, []);

  const leave = useCallback(async () => {
    const client = getAgoraClient();
    localAudioRef.current?.close();
    localVideoRef.current?.close();
    screenTrackRef.current?.close();
    localAudioRef.current = null;
    localVideoRef.current = null;
    screenTrackRef.current = null;
    await client.leave();
    resetAgoraClient();
    setConnectionState('ended');
  }, []);

  return {
    client: getAgoraClient(),
    connectionState,
    localAudioTrack,
    localVideoTrack,
    remoteUsers,
    isMicEnabled,
    isCameraEnabled,
    isScreenSharing,
    toggleMic,
    toggleCamera,
    startScreenShare,
    stopScreenShare,
    leave,
    error,
  };
}
