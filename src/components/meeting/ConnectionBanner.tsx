'use client';

import { ConnectionState } from '@/types/agora';

const CONFIG: Partial<Record<ConnectionState, { text: string; bg: string; icon: string }>> = {
  joining:      { text: 'Joining classroom…',                              bg: 'bg-warning-amber/10 border-warning-amber/30 text-warning-amber', icon: '⏳' },
  connecting:   { text: 'Connecting to media…',                            bg: 'bg-warning-amber/10 border-warning-amber/30 text-warning-amber', icon: '📡' },
  reconnecting: { text: 'Reconnecting… please wait',                       bg: 'bg-warning-amber/10 border-warning-amber/30 text-warning-amber', icon: '🔄' },
  disconnected: { text: 'Connection lost. Attempting to reconnect…',       bg: 'bg-live-red/10 border-live-red/30 text-live-red',               icon: '⚠️' },
  error:        { text: 'Connection failed. Refresh the page to rejoin.',  bg: 'bg-live-red/10 border-live-red/30 text-live-red',               icon: '❌' },
};

export default function ConnectionBanner({ state }: { state: ConnectionState }) {
  const cfg = CONFIG[state];
  if (!cfg) return null;

  return (
    <div className={`border-b px-4 py-2 text-xs font-medium text-center flex items-center justify-center gap-2 ${cfg.bg}`}>
      <span>{cfg.icon}</span>
      <span>{cfg.text}</span>
      {state === 'reconnecting' && (
        <svg className="w-3.5 h-3.5 animate-spin ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      )}
    </div>
  );
}
