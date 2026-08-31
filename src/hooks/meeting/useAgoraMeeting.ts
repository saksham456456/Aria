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

  // Refs for cleanup — never put tracks in useEffect deps
  const localAudioTrackRef = useRef<IMicrophoneAudioTrack | null>(null);
  const localVideoTrackRef = useRef<ICameraVideoTrack | null>(null);
  const screenTrackRef = useRef<ILocalVideoTrack | null>(null);
  const subscribedRef = useRef<Set<string>>(new Set());
  const initRef = useRef(false);

  const joinMeeting = useCallback(async () => {
    if (initRef.current) return;
    initRef.current = true;

    try {
      setConnectionState('joining');
      const client = getAgoraClient();
      const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
      if (!appId) throw new Error('Agora App ID not configured');

      const token = await fetchAgoraToken(sessionId, appUserId);

      // ── Event handlers ────────────────────────────────────────────────

      client.on('user-published', async (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
        const key = `${user.uid}:${mediaType}`;
        if (subscribedRef.current.has(key)) return;
        subscribedRef.current.add(key);

        await client.subscribe(user, mediaType);

        if (mediaType === 'audio') {
          // Audio plays directly — no DOM element needed
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
        const map: Record<string, ConnectionState> = {
          DISCONNECTED: 'disconnected' as ConnectionState,
          CONNECTING: 'connecting',
          CONNECTED: 'connected',
          RECONNECTING: 'reconnecting',
          DISCONNECTING: 'disconnecting' as ConnectionState,
        };
        setConnectionState(map[curState] ?? 'error');
      });

      // ── Join and create tracks ────────────────────────────────────────

      setConnectionState('connecting');
      await client.join(appId, sessionId, token, appUserId);

      const [audio, video] = await AgoraRTC.createMicrophoneAndCameraTracks(
        {},
        { encoderConfig: '360p_7' }
      );

      // Store in refs for cleanup
      localAudioTrackRef.current = audio;
      localVideoTrackRef.current = video;

      // Store in state for rendering
      setLocalAudioTrack(audio);
      setLocalVideoTrack(video);

      await client.publish([audio, video]);
      setConnectionState('connected');

    } catch (err: unknown) {
      console.error('[AGORA] join failed', err);
      setError(err instanceof Error ? err.message : String(err));
      setConnectionState('error');
      initRef.current = false;
    }
  }, [sessionId, appUserId]);

  // Single effect — no tracks in deps
  useEffect(() => {
    joinMeeting();

    return () => {
      const client = getAgoraClient();
      client.removeAllListeners();
      localAudioTrackRef.current?.close();
      localVideoTrackRef.current?.close();
      screenTrackRef.current?.close();
      client.leave().catch(console.error);
      resetAgoraClient();
    };
  }, [joinMeeting]);

  // ── Controls ─────────────────────────────────────────────────────────

  const toggleMic = useCallback(async () => {
    if (!localAudioTrackRef.current) return;
    const next = !isMicEnabled;
    await localAudioTrackRef.current.setEnabled(next);
    setIsMicEnabled(next);
  }, [isMicEnabled]);

  const toggleCamera = useCallback(async () => {
    if (!localVideoTrackRef.current) return;
    const next = !isCameraEnabled;
    await localVideoTrackRef.current.setEnabled(next);
    setIsCameraEnabled(next);
  }, [isCameraEnabled]);

  const startScreenShare = useCallback(async () => {
    try {
      const client = getAgoraClient();
      const screenTrack = await AgoraRTC.createScreenVideoTrack({}, 'disable');

      // Handle browser ending share
      (screenTrack as ILocalVideoTrack).on('track-ended', async () => {
        await client.unpublish(screenTrack as ILocalVideoTrack);
        (screenTrack as ILocalVideoTrack).close();
        if (localVideoTrackRef.current) {
          await client.publish(localVideoTrackRef.current);
        }
        screenTrackRef.current = null;
        setIsScreenSharing(false);
      });

      if (localVideoTrackRef.current) {
        await client.unpublish(localVideoTrackRef.current);
      }
      await client.publish(screenTrack as ILocalVideoTrack);
      screenTrackRef.current = screenTrack as ILocalVideoTrack;
      setIsScreenSharing(true);
    } catch (err) {
      // User cancelled permission dialog — not an error
      console.warn('[AGORA] screen share cancelled or failed', err);
    }
  }, []);

  const stopScreenShare = useCallback(async () => {
    const client = getAgoraClient();
    if (screenTrackRef.current) {
      await client.unpublish(screenTrackRef.current);
      screenTrackRef.current.close();
      screenTrackRef.current = null;
    }
    if (localVideoTrackRef.current) {
      await client.publish(localVideoTrackRef.current);
    }
    setIsScreenSharing(false);
  }, []);

  const leave = useCallback(async () => {
    const client = getAgoraClient();
    localAudioTrackRef.current?.close();
    localVideoTrackRef.current?.close();
    screenTrackRef.current?.close();
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
