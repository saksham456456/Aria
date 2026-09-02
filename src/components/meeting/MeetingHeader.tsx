'use client';

import { useEffect, useState } from 'react';
import { ConnectionState } from '@/types/agora';

const CONNECTION_DOT: Record<ConnectionState, string> = {
  connected:    'bg-connected-green',
  connecting:   'bg-warning-amber animate-pulse',
  reconnecting: 'bg-warning-amber animate-pulse',
  joining:      'bg-warning-amber animate-pulse',
  idle:         'bg-slate-500',
  disconnected: 'bg-live-red',
  disconnecting:'bg-live-red',
  ended:        'bg-slate-500',
  error:        'bg-live-red animate-pulse',
};

const CONNECTION_LABEL: Record<ConnectionState, string> = {
  connected:    'Connected',
  connecting:   'Connecting…',
  reconnecting: 'Reconnecting…',
  joining:      'Joining…',
  idle:         'Idle',
  disconnected: 'Disconnected',
  disconnecting:'Disconnecting…',
  ended:        'Ended',
  error:        'Error',
};

type MeetingHeaderProps = {
  title:           string;
  topic?:          string;
  status:          string;
  connectionState: ConnectionState;
  startedAt?:      string;
  participantCount?: number;
  grade?: string;
  subject?: string;
  joinCode?:       string;
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export default function MeetingHeader({ title, topic, status, connectionState, startedAt, participantCount, grade, subject, joinCode }: MeetingHeaderProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startedAt) return;
    const startTime = new Date(startedAt).getTime();
    const tick = () => setElapsed(Math.floor((Date.now() - startTime) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  return (
    <header className="h-14 flex items-center justify-between px-4 bg-surface-0/90 backdrop-blur-xl border-b border-white/[0.06] shrink-0">
      {/* Left — ARIA logo + class name + topic */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="shrink-0 w-8 h-8 rounded-lg bg-aria-purple flex items-center justify-center">
          <span className="text-white text-xs font-black">AI</span>
        </div>
        <div className="min-w-0">
          <p className="text-white text-sm font-semibold truncate leading-tight flex items-center gap-2">
            {title}
            {grade && <span className="px-1.5 py-0.5 rounded bg-surface-2 text-[10px] text-slate-300 border border-surface-3">{grade}</span>}
            {subject && <span className="px-1.5 py-0.5 rounded bg-surface-2 text-[10px] text-slate-300 border border-surface-3">{subject}</span>}
          </p>
          {topic && (
            <p className="text-slate-400 text-xs truncate leading-tight hidden sm:block">{topic}</p>
          )}
        </div>
      </div>

      {/* Center — live indicator + timer */}
      {status === 'active' && (
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className="flex items-center gap-1.5 text-live-red">
            <span className="w-2 h-2 rounded-full bg-live-red animate-pulse" />
            <span className="hidden sm:inline">LIVE</span>
          </span>
          <span className="text-slate-400 font-mono tabular-nums">{formatTime(elapsed)}</span>
        </div>
      )}

      {/* Right — connection status */}
      <div className="flex items-center gap-4 shrink-0">

        {joinCode && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-aria-purple/10 border border-aria-purple/20">
            <span className="text-[10px] text-slate-400">Code:</span>
            <span className="text-xs font-mono font-bold text-aria-purple-light tracking-wider">{joinCode}</span>
          </div>
        )}

        {/* Participant Count */}
        {participantCount !== undefined && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-2 border border-surface-3">
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span className="text-xs font-semibold text-slate-300">{participantCount}</span>
          </div>
        )}

        <span className={`w-2 h-2 rounded-full shrink-0 ${CONNECTION_DOT[connectionState] ?? 'bg-slate-500'}`} />
        <span className="text-xs text-slate-400 hidden sm:block">{CONNECTION_LABEL[connectionState] ?? connectionState}</span>
      </div>
    </header>
  );
}
