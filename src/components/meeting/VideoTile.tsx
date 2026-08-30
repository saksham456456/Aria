import { useEffect, useRef } from 'react';
import { ILocalVideoTrack, IRemoteVideoTrack } from 'agora-rtc-sdk-ng';

type VideoTileProps = {
  user?: { uid: string; hasAudio: boolean; hasVideo: boolean; videoTrack?: IRemoteVideoTrack };
  isLocal?: boolean;
  name?: string;
  role?: string;
  track?: ILocalVideoTrack | IRemoteVideoTrack | null;
  hasAudio?: boolean;
  hasVideo?: boolean;
};

export default function VideoTile({ user, isLocal, name, role, track, hasAudio, hasVideo }: VideoTileProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !track) return;

    track.play(containerRef.current);

    return () => {
      track.stop(); // stop, not close, so it can resume if re-enabled
    };
  }, [track]);

  const showVideo = isLocal ? hasVideo : user?.hasVideo;
  const isMicOn = isLocal ? hasAudio : user?.hasAudio;

  return (
    <div className="bg-gray-800 rounded-lg border-2 border-gray-600 relative overflow-hidden flex items-center justify-center h-full min-h-[200px]">
      <div
        ref={containerRef}
        className={`w-full h-full object-cover ${showVideo ? 'block' : 'hidden'}`}
      ></div>

      {!showVideo && (
        <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center text-2xl text-white">
          {name?.charAt(0) || user?.uid.charAt(0) || 'U'}
        </div>
      )}

      <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-white text-xs flex gap-2 items-center">
        <span>{name || user?.uid} ({role})</span>
        <span className={isMicOn ? 'text-green-400' : 'text-red-400'}>
          {isMicOn ? '🎙️' : '🔇'}
        </span>
      </div>
    </div>
  );
}
