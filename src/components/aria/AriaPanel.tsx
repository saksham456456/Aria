'use client';

interface AriaPanelProps {
  onClose: () => void;
}

export default function AriaPanel({ onClose }: AriaPanelProps) {
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

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        <div className="rounded-xl border border-connected-green/40 bg-connected-green/5 p-4 text-center">
          <p className="text-sm font-semibold text-connected-green mb-2">Agora AI Engine Connected</p>
          <p className="text-xs text-slate-300 leading-relaxed">
            ARIA has been upgraded to use the official Agora Conversational AI Engine!
          </p>
        </div>

        <p className="text-xs text-slate-400 text-center px-2">
          Simply use your microphone to speak with her. She handles listening and speaking automatically on Agora's low-latency network.
        </p>
      </div>
    </div>
  );
}
