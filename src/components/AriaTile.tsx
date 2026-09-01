import React from 'react';
import { AriaState } from '@/types/meeting';

interface AriaTileProps {
  ariaState: AriaState;
  onIntervene?: () => void;
  isTeacher?: boolean;
}

export const AriaTile: React.FC<AriaTileProps> = ({ ariaState }) => {
  return (
    <div className={`relative rounded-2xl overflow-hidden flex flex-col items-center justify-center p-6 bg-gradient-to-b from-surface-1 to-surface-0 border transition-all duration-300 shadow-2xl ${
      ariaState.isSpeaking ? 'border-aria-purple ring-4 ring-aria-purple/30' : 'border-surface-3'
    }`}>
      <div className={`absolute inset-0 bg-aria-purple/10 blur-3xl transition-opacity duration-500 ${ariaState.isSpeaking ? 'opacity-100' : 'opacity-20'}`} />

      <div className="relative z-10 flex items-center justify-center">
        <div className={`w-28 h-28 rounded-full bg-gradient-to-tr from-aria-purple-dim via-aria-purple to-aria-purple-light flex items-center justify-center shadow-lg transition-transform duration-300 ${
          ariaState.isSpeaking ? 'scale-110 animate-pulse-ring' : 'scale-100'
        }`}>
          <div className="w-24 h-24 rounded-full bg-surface-0 flex flex-col items-center justify-center">
            <div className="flex items-center gap-1 h-8">
              <span className={`w-1.5 bg-aria-purple-light rounded-full transition-all duration-150 ${ariaState.isSpeaking ? 'h-7 animate-speaking-bar' : 'h-2'}`} />
              <span className={`w-1.5 bg-aria-purple rounded-full transition-all duration-200 ${ariaState.isSpeaking ? 'h-9 animate-speaking-bar [animation-delay:150ms]' : 'h-3'}`} />
              <span className={`w-1.5 bg-aria-purple-light rounded-full transition-all duration-150 ${ariaState.isSpeaking ? 'h-6 animate-speaking-bar [animation-delay:300ms]' : 'h-2'}`} />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 z-10 text-center">
        <div className="flex items-center justify-center gap-2">
          <h3 className="text-white font-semibold text-base tracking-wide">ARIA</h3>
          <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-md bg-aria-purple/20 text-aria-purple-light border border-aria-purple/40">
            Co-Teacher
          </span>
        </div>

        <p className="text-xs text-gray-400 mt-1 flex items-center justify-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${
            ariaState.isSpeaking ? 'bg-role-aria animate-ping' :
            ariaState.isEvaluating ? 'bg-warning-amber animate-pulse' : 'bg-connected-green'
          }`} />
          {ariaState.isSpeaking ? 'Speaking to class...' : ariaState.isEvaluating ? 'Analyzing discussion...' : 'Listening actively'}
        </p>
      </div>

      {ariaState.currentResponse && (
        <div className="absolute bottom-4 inset-x-4 z-20 bg-surface-2/90 backdrop-blur-md p-3 rounded-xl border border-aria-purple/30 text-xs text-gray-200 animate-fade-in shadow-xl line-clamp-3">
          <span className="font-semibold text-aria-purple-light">ARIA: </span>
          {ariaState.currentResponse}
        </div>
      )}
    </div>
  );
};
