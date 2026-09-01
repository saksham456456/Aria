'use client';

import { useEffect, useRef } from 'react';
import { ICameraVideoTrack, IRemoteVideoTrack } from 'agora-rtc-sdk-ng';
import { MicOff, UserRound } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface VideoTileProps {
  videoTrack: ICameraVideoTrack | IRemoteVideoTrack | null | undefined;
  name: string;
  role: string;
  isMuted: boolean;
  isCameraOff: boolean;
  isSpeaking: boolean;
}

export default function VideoTile({
  videoTrack,
  name,
  role,
  isMuted,
  isCameraOff,
  isSpeaking,
}: VideoTileProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (videoTrack && containerRef.current && !isCameraOff) {
      videoTrack.play(containerRef.current);
    }
    return () => {
      if (videoTrack) videoTrack.stop();
    };
  }, [videoTrack, isCameraOff]);

  return (
    <div
      className={`relative rounded-2xl overflow-hidden bg-zinc-900 border-2 transition-colors ${
        isSpeaking ? 'border-blue-500' : 'border-zinc-800'
      }`}
    >
      {isCameraOff || !videoTrack ? (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
          <div className="w-24 h-24 rounded-full bg-zinc-800 flex items-center justify-center">
            <UserRound className="w-12 h-12 text-zinc-600" />
          </div>
        </div>
      ) : (
        <div ref={containerRef} className="w-full h-full object-cover [&>div>video]:object-cover" />
      )}

      <div className="absolute bottom-3 left-3 flex items-center gap-2">
        <Badge variant="secondary" className="bg-black/50 hover:bg-black/50 text-white border-none backdrop-blur-md">
          {name} {role === 'teacher' ? '(Teacher)' : ''}
        </Badge>
        {isMuted && (
          <div className="w-6 h-6 rounded-full bg-red-500/80 backdrop-blur-md flex items-center justify-center">
            <MicOff className="w-3.5 h-3.5 text-white" />
          </div>
        )}
      </div>
    </div>
  );
}
