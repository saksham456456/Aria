import { useState, useEffect, useRef, useCallback } from 'react';
import AgoraRTC, { ICameraVideoTrack, IMicrophoneAudioTrack, IAgoraRTCRemoteUser } from 'agora-rtc-sdk-ng';
import { getAgoraClient } from '@/services/agora/agoraClient';
import { fetchAgoraToken } from '@/services/agora/tokenService';
import { AgoraUser, ConnectionState } from '@/types/agora';

export function useAgoraMeeting(sessionId: string, appUserId: string) {
  const [connectionState, setConnectionState] = useState<ConnectionState>('idle');
  const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null);
  const [localVideoTrack, setLocalVideoTrack] = useState<ICameraVideoTrack | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<Record<string, AgoraUser>>({});

  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [isScreenSharing] = useState(false); // will implement in Phase 4
  const [error, setError] = useState<string | null>(null);

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

      const subscribedRef = new Set<string>(); // use local variable in joinMeeting

      client.on('user-published', async (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
        const key = `${user.uid}:${mediaType}`;
        if (subscribedRef.has(key)) return;
        subscribedRef.add(key);
        await client.subscribe(user, mediaType);
        const uid = String(user.uid);

        setRemoteUsers(prev => {
          const prevUser = prev[uid] || { uid, hasAudio: false, hasVideo: false };
          return {
            ...prev,
            [uid]: {
              ...prevUser,
              audioTrack: mediaType === 'audio' ? user.audioTrack : prevUser.audioTrack,
              videoTrack: mediaType === 'video' ? user.videoTrack : prevUser.videoTrack,
              hasAudio: mediaType === 'audio' || prevUser.hasAudio,
              hasVideo: mediaType === 'video' || prevUser.hasVideo,
            }
          };
        });
      });

      client.on('user-unpublished', (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
        const uid = String(user.uid);
        setRemoteUsers(prev => {
          if (!prev[uid]) return prev;
          const prevUser = prev[uid];
          return {
            ...prev,
            [uid]: {
              ...prevUser,
              audioTrack: mediaType === 'audio' ? undefined : prevUser.audioTrack,
              videoTrack: mediaType === 'video' ? undefined : prevUser.videoTrack,
              hasAudio: mediaType === 'audio' ? false : prevUser.hasAudio,
              hasVideo: mediaType === 'video' ? false : prevUser.hasVideo,
            }
          };
        });
      });

      client.on('user-left', (user: IAgoraRTCRemoteUser) => {
        const uid = String(user.uid);
        setRemoteUsers(prev => {
          const newUsers = { ...prev };
          delete newUsers[uid];
          return newUsers;
        });
      });

      client.on('connection-state-change', (curState) => {
        if (curState === 'DISCONNECTED') setConnectionState('disconnected' as ConnectionState);
        else if (curState === 'CONNECTING') setConnectionState('connecting');
        else if (curState === 'CONNECTED') setConnectionState('connected');
        else if (curState === 'RECONNECTING') setConnectionState('reconnecting');
      });

      setConnectionState('connecting');
      await client.join(appId, sessionId, token, appUserId);

      const tracks = await AgoraRTC.createMicrophoneAndCameraTracks();
      const [audio, video] = tracks;
      setLocalAudioTrack(audio);
      setLocalVideoTrack(video);

      await client.publish(tracks);
      setConnectionState('connected');

    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : String(err));
      setConnectionState('error');
      initRef.current = false;
    }
  }, [sessionId, appUserId]);

  useEffect(() => {
    joinMeeting();

    return () => {
      const client = getAgoraClient();
      client.removeAllListeners();
      localAudioTrack?.close();
      localVideoTrack?.close();
      client.leave();
    };
  }, [joinMeeting, localAudioTrack, localVideoTrack]);

  const toggleMic = async () => {
    if (localAudioTrack) {
      const newState = !isMicEnabled;
      await localAudioTrack.setEnabled(newState);
      setIsMicEnabled(newState);
    }
  };

  const toggleCamera = async () => {
    if (localVideoTrack) {
      const newState = !isCameraEnabled;
      await localVideoTrack.setEnabled(newState);
      setIsCameraEnabled(newState);
    }
  };

  const leave = async () => {
      const client = getAgoraClient();
      localAudioTrack?.close();
      localVideoTrack?.close();
      await client.leave();
      setConnectionState('ended');
  };

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
    leave,
    error
  };
}
