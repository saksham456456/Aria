import { useEffect, useState, useRef, useCallback } from 'react';
import type {
  IAgoraRTCClient,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
  IAgoraRTCRemoteUser
} from 'agora-rtc-sdk-ng';

export function useAgoraMeeting(channelName: string, uid: number) {
  const [client, setClient] = useState<IAgoraRTCClient | null>(null);
  const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null);
  const [localVideoTrack, setLocalVideoTrack] = useState<ICameraVideoTrack | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);
  const [activeSpeakerUid, setActiveSpeakerUid] = useState<string | number | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  const localAudioRef = useRef<IMicrophoneAudioTrack | null>(null);
  const localVideoRef = useRef<ICameraVideoTrack | null>(null);
  const clientRef = useRef<IAgoraRTCClient | null>(null);

  useEffect(() => {
    let mounted = true;

    const initAgora = async () => {
      const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;
      const agoraClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      clientRef.current = agoraClient;
      setClient(agoraClient);

      try {
        const res = await fetch('/api/agora/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ channelName, uid, role: 'publisher' })
        });
        const { token } = await res.json();

        agoraClient.on('user-published', async (user, mediaType) => {
          await agoraClient.subscribe(user, mediaType);

          if (mediaType === 'audio') {
            user.audioTrack?.play();
          }

          setRemoteUsers((prev) => [...prev.filter((u) => u.uid !== user.uid), user]);
        });

        agoraClient.on('user-unpublished', (user, mediaType) => {
          if (mediaType === 'audio') {
            user.audioTrack?.stop();
          }
          setRemoteUsers((prev) => [...prev.filter((u) => u.uid !== user.uid), user]);
        });

        agoraClient.on('user-left', (user) => {
          setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
        });

        agoraClient.enableAudioVolumeIndicator();
        agoraClient.on('volume-indicator', (volumes) => {
          const speaker = volumes.find((v) => v.level > 8);
          setActiveSpeakerUid(speaker ? speaker.uid : null);
        });

        const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID!;
        await agoraClient.join(appId, channelName, token, uid);

        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        const videoTrack = await AgoraRTC.createCameraVideoTrack();

        localAudioRef.current = audioTrack;
        localVideoRef.current = videoTrack;

        if (mounted) {
          setLocalAudioTrack(audioTrack);
          setLocalVideoTrack(videoTrack);
          await agoraClient.publish([audioTrack, videoTrack]);
          setIsJoined(true);
        }
      } catch (err) {
        console.error('Agora initialization failed:', err);
      }
    };

    if (channelName && uid) {
      initAgora();
    }

    return () => {
      mounted = false;
      if (localAudioRef.current) {
        localAudioRef.current.stop();
        localAudioRef.current.close();
      }
      if (localVideoRef.current) {
        localVideoRef.current.stop();
        localVideoRef.current.close();
      }
      if (clientRef.current) {
        clientRef.current.leave();
      }
    };
  }, [channelName, uid]);

  const toggleMic = useCallback(async () => {
    if (localAudioRef.current) {
      await localAudioRef.current.setMuted(!isMuted);
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const toggleCamera = useCallback(async () => {
    if (localVideoRef.current) {
      await localVideoRef.current.setEnabled(isCameraOff);
      setIsCameraOff(!isCameraOff);
    }
  }, [isCameraOff]);

  return {
    client,
    localAudioTrack,
    localVideoTrack,
    remoteUsers,
    activeSpeakerUid,
    isJoined,
    isMuted,
    isCameraOff,
    toggleMic,
    toggleCamera
  };
}
