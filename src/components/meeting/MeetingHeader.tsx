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
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export default function MeetingHeader({ title, topic, status, connectionState, startedAt }: MeetingHeaderProps) {
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
    <header className="h-14 flex items-center justify-between px-4 bg-surface-1 border-b border-surface-3 shrink-0">
      {/* Left — ARIA logo + class name + topic */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="shrink-0 w-8 h-8 rounded-lg bg-aria-purple flex items-center justify-center">
          <span className="text-white text-xs font-black">AI</span>
        </div>
        <div className="min-w-0">
          <p className="text-white text-sm font-semibold truncate leading-tight">{title}</p>
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
      <div className="flex items-center gap-2 shrink-0">
        <span className={`w-2 h-2 rounded-full shrink-0 ${CONNECTION_DOT[connectionState] ?? 'bg-slate-500'}`} />
        <span className="text-xs text-slate-400 hidden sm:block">{CONNECTION_LABEL[connectionState] ?? connectionState}</span>
      </div>
    </header>
  );
}
