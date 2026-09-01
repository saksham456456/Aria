'use client';

import { IAgoraRTCClient } from 'agora-rtc-sdk-ng';
import { AriaMode, AriaState } from '@/hooks/aria/useAria';
import { useAriaVoice } from '@/hooks/aria/useAriaVoice';

const COMMANDS = [
  { label: 'Explain this',                cmd: 'Please explain the current concept in simpler terms.' },
  { label: 'Quiz the class',              cmd: 'Ask the class one targeted quiz question on what we just covered.' },
  { label: 'Summarize so far',            cmd: 'Briefly summarize what has been taught in this session so far.' },
  { label: 'Check learning gaps',         cmd: 'What concepts are students struggling with? Be specific.' },
  { label: 'Encourage participation',     cmd: 'Encourage students to ask questions or share their understanding.' },
  { label: 'Give a real-world example',   cmd: 'Give a real-world example to illustrate the current concept.' },
];

const MODE_CONFIG: Record<AriaMode, { label: string; desc: string; color: string }> = {
  auto:   { label: 'Auto',   desc: 'Intervenes automatically when appropriate',    color: 'border-connected-green/40 bg-connected-green/5 text-connected-green' },
  manual: { label: 'Manual', desc: 'Responds only to your direct commands',         color: 'border-warning-amber/40 bg-warning-amber/5 text-warning-amber' },
  silent: { label: 'Silent', desc: 'Listens and records insights — never speaks', color: 'border-surface-3 bg-surface-2 text-slate-400' },
};

interface AriaPanelProps {
  sessionId:     string;
  appUserId:     string;
  ariaMode:      AriaMode;
  ariaState:     AriaState;
  ariaPaused:    boolean;
  agoraClient:   IAgoraRTCClient;
  onModeChange:  (mode: AriaMode) => void;
  onPause:       () => void;
  onResume:      () => void;
  onCommand:     (cmd: string) => void;
  onClose:       () => void;
}

export default function AriaPanel({
  appUserId, ariaMode, ariaState, ariaPaused,
  agoraClient, onModeChange, onPause, onResume, onCommand, onClose,
}: AriaPanelProps) {
  const { speak, voiceState, error: voiceError } = useAriaVoice(appUserId);

  const handleTestVoice = () => {
    speak('Hello! I am ARIA, your AI co-teacher. I am ready to assist your classroom.', agoraClient);
  };

  const isBusy = voiceState === 'fetching' || voiceState === 'speaking';

  return (
    <div className="w-80 shrink-0 border-l border-surface-3 bg-surface-1 flex flex-col h-full animate-slide-in-right">
      {/* Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-surface-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-aria-purple flex items-center justify-center">
            <span className="text-white text-[10px] font-black">AI</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-white leading-tight">ARIA Controls</p>
            <p className={`text-[10px] leading-tight ${
              ariaState === 'speaking' ? 'text-aria-purple-light' :
              ariaState === 'thinking' ? 'text-warning-amber' :
              ariaState === 'paused'   ? 'text-slate-500' :
              'text-slate-400'
            }`}>{
              ariaState === 'speaking' ? '● Speaking' :
              ariaState === 'thinking' ? '◉ Thinking…' :
              ariaState === 'paused'   ? '⏸ Paused' :
              '◎ Listening'
            }</p>
          </div>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white text-lg leading-none">&times;</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">

        {/* Mode selection */}
        <section>
          <h3 className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-2">Mode</h3>
          <div className="space-y-1.5">
            {(Object.entries(MODE_CONFIG) as [AriaMode, typeof MODE_CONFIG.auto][]).map(([mode, cfg]) => (
              <button
                key={mode}
                onClick={() => onModeChange(mode)}
                className={`w-full text-left px-3 py-2.5 rounded-xl border text-sm transition-all ${
                  ariaMode === mode ? cfg.color : 'border-surface-3 bg-surface-2 text-slate-400 hover:border-surface-3 hover:text-slate-200'
                }`}
              >
                <span className="font-semibold">{cfg.label}</span>
                <span className="block text-xs opacity-70 mt-0.5">{cfg.desc}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Pause / Resume */}
        <section>
          <h3 className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-2">Control</h3>
          {ariaPaused ? (
            <button
              onClick={onResume}
              className="w-full py-2.5 rounded-xl bg-connected-green/10 border border-connected-green/30 text-connected-green text-sm font-semibold hover:bg-connected-green/20 transition-colors"
            >
              ▶ Resume ARIA
            </button>
          ) : (
            <button
              onClick={onPause}
              className="w-full py-2.5 rounded-xl bg-warning-amber/10 border border-warning-amber/30 text-warning-amber text-sm font-semibold hover:bg-warning-amber/20 transition-colors"
            >
              ⏸ Pause ARIA
            </button>
          )}
        </section>

        {/* Teacher commands */}
        <section>
          <h3 className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-2">Commands</h3>
          <div className="space-y-1.5">
            {COMMANDS.map(({ label, cmd }) => (
              <button
                key={label}
                onClick={() => onCommand(cmd)}
                disabled={ariaPaused || ariaMode === 'silent' || isBusy}
                className="w-full text-left px-3 py-2.5 rounded-xl bg-surface-2 border border-surface-3 hover:border-aria-purple/40 hover:bg-aria-purple/5 text-sm text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        {/* Test voice */}
        <section className="pt-2 border-t border-surface-3">
          <h3 className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-2">Voice Test</h3>
          <button
            onClick={handleTestVoice}
            disabled={isBusy}
            className="w-full py-2.5 rounded-xl bg-aria-purple hover:bg-aria-purple/80 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
          >
            {voiceState === 'fetching'  ? 'Fetching audio…' :
             voiceState === 'speaking'  ? 'Speaking…' :
             'Test ARIA Voice'}
          </button>
          {voiceError && (
            <p className="text-live-red text-xs mt-2 leading-snug">{voiceError}</p>
          )}
          {voiceState === 'speaking' && (
            <p className="text-aria-purple-light text-xs mt-2">
              ✓ Speaking — all participants should hear ARIA now.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
