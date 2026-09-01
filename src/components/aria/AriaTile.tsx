'use client';

import { AriaState } from '@/hooks/aria/useAria';

const STATE_CONFIG: Record<AriaState, { label: string; border: string; bg: string; labelColor: string }> = {
  listening: {
    label:      'Listening',
    border:     'border-aria-purple/40',
    bg:         'bg-aria-purple-dim/20',
    labelColor: 'text-aria-purple-light',
  },
  thinking: {
    label:      'Thinking…',
    border:     'border-warning-amber/40',
    bg:         'bg-amber-950/30',
    labelColor: 'text-warning-amber',
  },
  speaking: {
    label:      'Speaking',
    border:     'border-aria-purple animate-pulse-ring',
    bg:         'bg-aria-purple-dim/30',
    labelColor: 'text-aria-purple-light',
  },
  paused: {
    label:      'Paused',
    border:     'border-surface-3',
    bg:         'bg-surface-1',
    labelColor: 'text-slate-500',
  },
  error: {
    label:      'Error',
    border:     'border-live-red/40',
    bg:         'bg-red-950/30',
    labelColor: 'text-live-red',
  },
};

interface AriaTileProps {
  state: AriaState;
}

export default function AriaTile({ state }: AriaTileProps) {
  const cfg = STATE_CONFIG[state];

  return (
    <div className={`relative overflow-hidden rounded-xl border min-h-[160px] sm:min-h-[200px] flex flex-col items-center justify-center gap-3 transition-all duration-500 ${cfg.border} ${cfg.bg}`}>

      {/* Role badge */}
      <div className="absolute top-2 left-2">
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded border bg-aria-purple/20 text-aria-purple-light border-aria-purple/30 uppercase tracking-wide">
          AI
        </span>
      </div>

      {/* Avatar / animation */}
      <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
        state === 'paused' ? 'bg-surface-3' : 'bg-aria-purple/30'
      }`}>
        {state === 'thinking' ? (
          /* Spinning dots for "thinking" */
          <div className="flex gap-1">
            {[0, 1, 2].map(i => (
              <span
                key={i}
                className="w-2 h-2 bg-warning-amber rounded-full animate-bounce"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        ) : state === 'speaking' ? (
          /* Equalizer bars for "speaking" */
          <div className="flex items-end gap-0.5 h-8">
            {[0, 150, 300].map((delay, i) => (
              <div
                key={i}
                className="w-1.5 bg-aria-purple-light rounded-full animate-speaking-bar origin-bottom"
                style={{ height: '100%', animationDelay: `${delay}ms` }}
              />
            ))}
          </div>
        ) : state === 'error' ? (
          <svg className="w-8 h-8 text-live-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        ) : (
          <span className={`text-2xl font-bold select-none transition-opacity duration-500 ${state === 'paused' ? 'opacity-30' : 'opacity-100'} text-aria-purple-light`}>
            AI
          </span>
        )}
      </div>

      {/* Name + status */}
      <div className="text-center">
        <p className="text-white text-sm font-medium">ARIA Co-Teacher</p>
        <p className={`text-xs mt-0.5 ${cfg.labelColor}`}>{cfg.label}</p>
      </div>
    </div>
  );
}
