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

  const roleColor = role === 'teacher' ? 'bg-role-teacher' : 'bg-role-student';
  const roleTextColor = role === 'teacher' ? 'text-role-teacher' : 'text-role-student';

  return (
    <div className={`bg-surface-1 rounded-xl border relative overflow-hidden flex flex-col items-center justify-center h-full min-h-[200px] w-full transition-all duration-300 ${isMicOn ? 'border-connected-green ring-1 ring-connected-green/50' : 'border-surface-3'}`}>

      {/* Absolute top left badge */}
      <div className={`absolute top-3 left-3 px-2 py-0.5 rounded text-xs font-bold tracking-wider capitalize ${roleColor}/20 ${roleTextColor} z-10`}>
         {role}
      </div>

      <div
        ref={containerRef}
        className={`w-full h-full object-cover absolute inset-0 z-0 ${showVideo ? 'block' : 'hidden'}`}
      ></div>

      {!showVideo && (
        <div className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl text-white font-bold bg-gradient-to-br ${role === 'teacher' ? 'from-blue-600 to-blue-800' : 'from-green-600 to-green-800'} shadow-lg z-10`}>
          {name?.charAt(0).toUpperCase() || user?.uid.charAt(0).toUpperCase() || 'U'}
        </div>
      )}

      {/* Bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 h-10 bg-surface-0/60 backdrop-blur-sm flex items-center px-3 justify-between border-t border-surface-3 z-10">
         <span className="text-white text-sm font-medium truncate pr-2">{name || user?.uid} {isLocal && '(You)'}</span>
         <span className={`flex items-center justify-center w-6 h-6 rounded-full shrink-0 ${isMicOn ? 'bg-surface-3 text-connected-green' : 'bg-live-red/20 text-live-red'}`}>
          {isMicOn ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="2" y1="2" x2="22" y2="22"></line><path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2"></path><path d="M5 10v2a7 7 0 0 0 12 5"></path><path d="M15 9.34V5a3 3 0 0 0-5.68-1.33"></path><path d="M9 9v3a3 3 0 0 0 5.12 2.12"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
          )}
         </span>
      </div>
    </div>
  );
}
