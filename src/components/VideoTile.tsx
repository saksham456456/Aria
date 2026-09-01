import React, { useEffect, useRef } from 'react';
import { ICameraVideoTrack, IRemoteVideoTrack } from 'agora-rtc-sdk-ng';

interface VideoTileProps {
  videoTrack: ICameraVideoTrack | IRemoteVideoTrack | null | undefined;
  name: string;
  role: string;
  isMuted?: boolean;
  isCameraOff?: boolean;
  isSpeaking?: boolean;
}

export const VideoTile: React.FC<VideoTileProps> = ({
  videoTrack,
  name,
  role,
  isMuted,
  isCameraOff,
  isSpeaking,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current || !videoTrack || isCameraOff) return;

    videoTrack.play(containerRef.current);

    return () => {
      videoTrack.stop();
    };
  }, [videoTrack, isCameraOff]);

  return (
    <div
      className={`relative rounded-2xl overflow-hidden bg-surface-1 border transition-all duration-300 flex items-center justify-center shadow-xl ${
        isSpeaking ? 'ring-4 ring-aria-purple border-aria-purple-light shadow-aria-purple/20' : 'border-surface-3'
      }`}
    >
      {!isCameraOff && videoTrack ? (
        <div ref={containerRef} className="w-full h-full object-cover [&>video]:object-cover" />
      ) : (
        <div className="flex flex-col items-center justify-center p-4">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-surface-3 flex items-center justify-center text-white text-xl md:text-2xl font-bold uppercase shadow-inner">
            {name ? name[0] : 'U'}
          </div>
          <span className="text-gray-400 text-xs mt-3">Camera is off</span>
        </div>
      )}

      <div className="absolute bottom-3 left-3 bg-surface-0/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-surface-3 flex items-center gap-2 text-xs font-medium text-white shadow-md">
        <span
          className={`w-2 h-2 rounded-full ${
            role === 'teacher' ? 'bg-role-teacher' : role === 'aria' ? 'bg-role-aria' : 'bg-role-student'
          }`}
        />
        <span>{name}</span>
        {isMuted && <span className="text-live-red font-bold text-[10px] ml-1">MUTED</span>}
      </div>
    </div>
  );
};
