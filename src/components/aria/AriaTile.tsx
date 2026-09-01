'use client';

import { Sparkles, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AriaTileProps {
  ariaState: 'listening' | 'thinking' | 'speaking' | 'paused' | 'error';
  onIntervene?: () => void;
  isTeacher?: boolean;
}

export default function AriaTile({ ariaState, onIntervene, isTeacher }: AriaTileProps) {

  const stateConfig = {
    listening: { color: 'bg-purple-500/20', border: 'border-purple-500/30', text: 'text-purple-400', label: 'Listening', icon: <Sparkles className="w-8 h-8" /> },
    thinking:  { color: 'bg-amber-500/20', border: 'border-amber-500/30', text: 'text-amber-400', label: 'Thinking...', icon: <Activity className="w-8 h-8 animate-pulse" /> },
    speaking:  { color: 'bg-emerald-500/20', border: 'border-emerald-500/50', text: 'text-emerald-400', label: 'Speaking', icon: <div className="w-8 h-8 flex items-center justify-between gap-1"><div className="w-1.5 h-full bg-emerald-400 animate-pulse" style={{animationDelay: '0ms'}}></div><div className="w-1.5 h-full bg-emerald-400 animate-pulse" style={{animationDelay: '150ms'}}></div><div className="w-1.5 h-full bg-emerald-400 animate-pulse" style={{animationDelay: '300ms'}}></div></div> },
    paused:    { color: 'bg-zinc-800', border: 'border-zinc-700', text: 'text-zinc-500', label: 'Paused', icon: <Sparkles className="w-8 h-8 opacity-50" /> },
    error:     { color: 'bg-red-500/20', border: 'border-red-500/30', text: 'text-red-400', label: 'Error', icon: <Sparkles className="w-8 h-8" /> },
  };

  const current = stateConfig[ariaState] || stateConfig.listening;

  const isSpeaking = ariaState === 'speaking';

  return (
    <div className={`relative rounded-2xl overflow-hidden ${current.color} border-2 ${current.border} flex flex-col items-center justify-center transition-all duration-300 ${isSpeaking ? 'ring-4 ring-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]' : ''}`}>

      <div className={`mb-4 ${current.text}`}>
        {current.icon}
      </div>

      <h3 className={`font-medium tracking-wide ${current.text}`}>
        ARIA Co-Teacher
      </h3>
      <p className={`text-sm opacity-80 ${current.text}`}>
        {current.label}
      </p>

      {isTeacher && ariaState !== 'paused' && ariaState !== 'speaking' && (
        <div className="absolute bottom-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onIntervene}
            className="bg-zinc-950/50 border-purple-500/50 text-purple-300 hover:bg-purple-900/50 hover:text-purple-200"
          >
            Ask ARIA to explain
          </Button>
        </div>
      )}
    </div>
  );
}
