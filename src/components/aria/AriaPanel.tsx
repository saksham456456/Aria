'use client';

import { useState } from 'react';

interface AriaPanelProps {
  onClose: () => void;
  onStartAria?: () => void;
}

export default function AriaPanel({ onClose, onStartAria }: AriaPanelProps) {
  const [hasStarted, setHasStarted] = useState(false);

  return (
    <div className="w-80 shrink-0 border-l border-white/[0.06] bg-surface-0/95 backdrop-blur-xl flex flex-col h-full animate-slide-in-right">
      <div className="h-14 px-4 flex items-center justify-between border-b border-surface-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-aria-purple flex items-center justify-center">
            <span className="text-white text-[10px] font-black">AI</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-white leading-tight">ARIA Co-Teacher</p>
            <p className="text-[10px] leading-tight text-connected-green">Active</p>
          </div>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white text-lg leading-none">&times;</button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        
        {/* NEW INVITE BUTTON */}
        {!hasStarted ? (
          <div className="rounded-xl border border-aria-purple/40 bg-aria-purple/10 p-4 text-center shadow-lg shadow-aria-purple/5">
            <p className="text-sm font-bold text-white mb-2">Invite ARIA</p>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Wait until all students have joined the room, then click below to invite ARIA to the class.
            </p>
            <button
              onClick={() => {
                setHasStarted(true);
                onStartAria?.();
              }}
              className="w-full py-2 px-4 bg-aria-purple hover:bg-aria-purple-dark text-white rounded-lg font-bold text-sm transition-colors"
            >
              Start AI Agent
            </button>
          </div>
        ) : (
          <div className="rounded-xl border border-connected-green/40 bg-connected-green/10 p-4 text-center shadow-lg shadow-connected-green/5">
            <div className="w-10 h-10 mx-auto bg-connected-green/20 rounded-full flex items-center justify-center mb-3">
              <span className="text-connected-green text-xl animate-pulse">Y&apos;</span>
            </div>
            <p className="text-sm font-bold text-white mb-1">Agora AI Engine Active</p>
            <p className="text-xs text-slate-300 leading-relaxed">
              ARIA is fully powered by Agora&apos;s low-latency Conversational AI. She is currently listening to the classroom.
            </p>
          </div>
        )}

        <div className="space-y-3">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">How to use ARIA</h3>
          
          <div className="bg-surface-1 border border-surface-3 rounded-xl p-3 flex gap-3 items-start">
            <div className="w-6 h-6 rounded bg-aria-purple/20 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-aria-purple text-xs">1</span>
            </div>
            <div>
              <p className="text-xs font-bold text-white mb-0.5">Just Speak</p>
              <p className="text-[11px] text-slate-400 leading-relaxed">No need to click anything. Just talk normally and ARIA will respond intelligently.</p>
            </div>
          </div>

          <div className="bg-surface-1 border border-surface-3 rounded-xl p-3 flex gap-3 items-start">
            <div className="w-6 h-6 rounded bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-emerald-400 text-xs">2</span>
            </div>
            <div>
              <p className="text-xs font-bold text-white mb-0.5">Deploy Pop Quizzes</p>
              <p className="text-[11px] text-slate-400 leading-relaxed">Click the Quiz button to generate an instant AI pop quiz based on what you just taught.</p>
            </div>
          </div>

          <div className="bg-surface-1 border border-surface-3 rounded-xl p-3 flex gap-3 items-start">
            <div className="w-6 h-6 rounded bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-amber-400 text-xs">3</span>
            </div>
            <div>
              <p className="text-xs font-bold text-white mb-0.5">Monitor Confusion</p>
              <p className="text-[11px] text-slate-400 leading-relaxed">Watch the Class Status radar. If students express confusion, ARIA logs the learning gap.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
