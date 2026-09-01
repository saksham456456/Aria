'use client';

import { IAgoraRTCRemoteUser, ICameraVideoTrack } from 'agora-rtc-sdk-ng';
import { Participant } from '@/types/session';
import VideoTile from './VideoTile';
import AriaTile from '../aria/AriaTile';

interface VideoGridProps {
  localParticipant: Participant;
  localVideoTrack: ICameraVideoTrack | null;
  remoteUsers: IAgoraRTCRemoteUser[];
  participants: Participant[];
  activeSpeakerId: string | null;
  ariaState: 'listening' | 'thinking' | 'speaking' | 'paused' | 'error';
  isMicEnabled: boolean;
  isVideoEnabled: boolean;
  onAriaForceIntervene?: () => void;
}

export default function VideoGrid({
  localParticipant,
  localVideoTrack,
  remoteUsers,
  participants,
  activeSpeakerId,
  ariaState,
  isMicEnabled,
  isVideoEnabled,
  onAriaForceIntervene
}: VideoGridProps) {

  const totalTiles = 1 + 1 + remoteUsers.length; // ARIA + Local + Remotes

  const gridLayout =
    totalTiles <= 2
      ? 'grid-cols-1 md:grid-cols-2'
      : totalTiles <= 4
      ? 'grid-cols-2'
      : 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4';

  return (
    <div className={`grid gap-4 w-full h-full auto-rows-fr ${gridLayout}`}>

      {/* ARIA Agent Tile */}
      <AriaTile
        ariaState={ariaState}
        onIntervene={onAriaForceIntervene}
        isTeacher={localParticipant.role === 'teacher'}
      />

      {/* Local User Tile */}
      <VideoTile
        videoTrack={localVideoTrack}
        name={`${localParticipant.name} (You)`}
        role={localParticipant.role}
        isMuted={!isMicEnabled}
        isCameraOff={!isVideoEnabled}
        isSpeaking={activeSpeakerId === localParticipant.id}
      />

      {/* Remote Users Tiles */}
      {remoteUsers.map((user) => {
        // Agora uses numbers for UID usually, match with participant id hash
        const participantInfo = participants.find(
          (p) => Math.abs(hashCode(p.id)) === user.uid
        );

        return (
          <VideoTile
            key={user.uid}
            videoTrack={user.videoTrack}
            name={participantInfo?.name || `User (${user.uid})`}
            role={participantInfo?.role || 'student'}
            isCameraOff={!user.hasVideo}
            isMuted={!user.hasAudio}
            isSpeaking={activeSpeakerId === participantInfo?.id}
          />
        );
      })}
    </div>
  );
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
