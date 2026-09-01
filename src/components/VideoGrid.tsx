import React from 'react';
import { IAgoraRTCRemoteUser, ICameraVideoTrack } from 'agora-rtc-sdk-ng';
import { Participant, AriaState } from '@/types/meeting';
import { VideoTile } from './VideoTile';
import { AriaTile } from './AriaTile';

interface VideoGridProps {
  localVideoTrack: ICameraVideoTrack | null;
  localName: string;
  localRole: string;
  isMuted: boolean;
  isCameraOff: boolean;
  remoteUsers: IAgoraRTCRemoteUser[];
  participants: Participant[];
  activeSpeakerUid: string | number | null;
  ariaState: AriaState;
  onIntervene?: () => void;
  isTeacher?: boolean;
}

export const VideoGrid: React.FC<VideoGridProps> = ({
  localVideoTrack,
  localName,
  localRole,
  isMuted,
  isCameraOff,
  remoteUsers,
  participants,
  activeSpeakerUid,
  ariaState,
  onIntervene,
  isTeacher,
}) => {
  const totalTiles = 1 + 1 + remoteUsers.length; // Local + ARIA + Remotes
  const gridLayout =
    totalTiles <= 2
      ? 'grid-cols-1 md:grid-cols-2'
      : totalTiles <= 4
      ? 'grid-cols-2'
      : 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4';

  return (
    <div className={`grid gap-4 p-4 h-full w-full auto-rows-fr ${gridLayout}`}>
      <AriaTile ariaState={ariaState} onIntervene={onIntervene} isTeacher={isTeacher} />

      <VideoTile
        videoTrack={localVideoTrack}
        name={`${localName} (You)`}
        role={localRole}
        isMuted={isMuted}
        isCameraOff={isCameraOff}
        isSpeaking={activeSpeakerUid === 0}
      />

      {remoteUsers.map((user) => {
        const participantInfo = participants.find(
          (p) => String(p.app_user_id) === String(user.uid) || Math.abs(hashCode(p.app_user_id)) === user.uid
        );

        return (
          <VideoTile
            key={user.uid}
            videoTrack={user.videoTrack}
            name={participantInfo?.name || `Student (${user.uid})`}
            role={participantInfo?.role || 'student'}
            isCameraOff={!user.hasVideo}
            isMuted={!user.hasAudio}
            isSpeaking={activeSpeakerUid === user.uid}
          />
        );
      })}
    </div>
  );
};

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}
