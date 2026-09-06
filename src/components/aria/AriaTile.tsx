'use client';

import { useState, useEffect } from 'react';
import { IAgoraRTCRemoteUser } from 'agora-rtc-sdk-ng';
import { AgoraUser } from '@/types/agora';

interface AriaTileProps {
  user?: AgoraUser | IAgoraRTCRemoteUser;
}

export default function AriaTile({ user }: AriaTileProps) {
  const isConnected = !!user;
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (!user || !user.hasAudio || !user.audioTrack) {
      setIsSpeaking(false);
      return;
    }

    const interval = setInterval(() => {
      try {
        const level = user.audioTrack?.getVolumeLevel() ?? 0;
        setIsSpeaking(level > 0.05);
      } catch {
        setIsSpeaking(false);
      }
    }, 150);

    return () => {
      clearInterval(interval);
      setIsSpeaking(false);
    };
  }, [user, user?.hasAudio, user?.audioTrack]);

  const border = isSpeaking ? 'border-aria-purple animate-pulse-ring' : 'border-aria-purple/40';
  const bg = isSpeaking ? 'bg-aria-purple-dim/30' : 'bg-aria-purple-dim/20';
  const label = isSpeaking ? 'Speaking' : (isConnected ? 'Listening' : 'Waiting...');

  return (
    <div className={`relative overflow-hidden rounded-xl border min-h-[160px] sm:min-h-[200px] flex flex-col items-center justify-center gap-3 transition-all duration-500 ${border} ${bg}`}>
      <div className="absolute top-2 left-2">
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded border bg-aria-purple/20 text-aria-purple-light border-aria-purple/30 uppercase tracking-wide">AI</span>
      </div>
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all duration-300 bg-aria-purple/30">
        {isSpeaking ? (
          <div className="flex items-end gap-0.5 h-8">
            {[0, 150, 300].map((delay, i) => (
              <div key={i} className="w-1.5 bg-aria-purple-light rounded-full animate-speaking-bar origin-bottom" style={{ height: '100%', animationDelay: `${delay}ms` }} />
            ))}
          </div>
        ) : (
          <span className="text-2xl font-bold select-none transition-opacity duration-500 text-aria-purple-light">AI</span>
        )}
      </div>
      <div className="text-center">
        <p className="text-white text-sm font-medium">ARIA Co-Teacher</p>
        <p className="text-xs mt-0.5 text-aria-purple-light">{label}</p>
      </div>
    </div>
  );
}
