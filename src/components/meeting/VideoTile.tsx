'use client';

import { useEffect, useRef } from 'react';
import { ILocalVideoTrack, IRemoteVideoTrack } from 'agora-rtc-sdk-ng';
import { AgoraUser } from '@/types/agora';

type VideoTileProps = {
  user?:      AgoraUser;
  isLocal?:   boolean;
  name?:      string;
  role?:      'teacher' | 'student';
  track?:     ILocalVideoTrack | IRemoteVideoTrack | null;
  hasAudio?:  boolean;
  hasVideo?:  boolean;
};

const ROLE_COLORS: Record<string, string> = {
  teacher: 'bg-role-teacher/20 text-role-teacher border-role-teacher/30',
  student: 'bg-role-student/20 text-role-student border-role-student/30',
};

const AVATAR_GRADIENTS: Record<string, string> = {
  teacher: 'from-blue-600 to-blue-800',
  student: 'from-emerald-600 to-emerald-800',
};

export default function VideoTile({ user, isLocal, name, role = 'student', track, hasAudio, hasVideo }: VideoTileProps) {
  const videoRef = useRef<HTMLDivElement>(null);

  const showVideo = isLocal ? hasVideo : (user ? user.hasVideo : false);
  const isMicOn   = isLocal ? hasAudio : (user ? user.hasAudio : false);
  const displayName = name ?? (user?.uid ? String(user.uid) : 'User');
  const initial     = displayName.charAt(0).toUpperCase();

  useEffect(() => {
    if (!videoRef.current || !track) return;
    track.play(videoRef.current);
    return () => { track.stop(); };
  }, [track]);

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-surface-1 shadow-lg transition-all duration-300 flex items-center justify-center h-full w-full ${
      isMicOn ? 'ring-2 ring-connected-green shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'border border-surface-3'
    }`}>
      {/* Video container — always rendered so Agora can attach the stream */}
      <div
        ref={videoRef}
        className={`absolute inset-0 w-full h-full object-cover ${showVideo ? 'block' : 'hidden'}`}
      />

      {/* Avatar shown when no video */}
      {!showVideo && (
        <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white bg-gradient-to-br ${AVATAR_GRADIENTS[role] ?? AVATAR_GRADIENTS.student}`}>
          {initial}
        </div>
      )}

      {/* Role badge — top left */}
      <div className="absolute top-2 left-2">
        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border uppercase tracking-wide ${ROLE_COLORS[role] ?? ROLE_COLORS.student}`}>
          {role}
        </span>
      </div>

      {/* Name + mic status — bottom bar (frosted glass) */}
      <div className="absolute bottom-3 left-3 right-3 px-3 py-2 flex items-center justify-between bg-black/40 backdrop-blur-md rounded-xl border border-white/10 shadow-sm">
        <span className="text-white text-xs font-medium truncate">
          {displayName}
          {isLocal && <span className="text-white/50 ml-1">(You)</span>}
        </span>
        <span className="shrink-0 ml-2">
          {isMicOn
            ? <svg className="w-3.5 h-3.5 text-connected-green" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a3 3 0 00-3 3v5a3 3 0 006 0V5a3 3 0 00-3-3zm-5 8a5 5 0 0010 0h-1a4 4 0 01-8 0H5zm5 6a6 6 0 006-6h-1a5 5 0 01-10 0H4a6 6 0 006 6z"/></svg>
            : <svg className="w-3.5 h-3.5 text-live-red"       fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A5 5 0 0015 10h-1a4 4 0 01-6.568 3.018L6 11.586A3 3 0 0013 10V7.828l2 2V10h1a6 6 0 01-1.285 3.716L16.13 15.13A7.96 7.96 0 0017 10a8 8 0 00-8-8 7.96 7.96 0 00-4.13 1.16L6.284 4.576A3 3 0 0110 2h.001A3 3 0 017 5v.828L5.586 4.414A5 5 0 015 7v3h1V7a4 4 0 011.717-3.283zM7.082 8.496l4.422 4.422A3 3 0 017 10V8.496z" clipRule="evenodd"/></svg>
          }
        </span>
      </div>
    </div>
  );
}
