import React from 'react';
import { AriaState, LearningGap } from '@/types/meeting';

interface AriaControlPanelProps {
  ariaState: AriaState;
  onSetMode: (mode: AriaState['mode']) => void;
  onForceIntervene: () => void;
  learningGaps: LearningGap[];
  onClose: () => void;
}

export const AriaControlPanel: React.FC<AriaControlPanelProps> = ({
  ariaState,
  onSetMode,
  onForceIntervene,
  learningGaps,
  onClose
}) => {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-surface-3 flex items-center justify-between">
        <h2 className="font-semibold text-sm text-white">ARIA Co-Teacher Controls</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white text-lg">×</button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-6">
        <div>
          <label className="text-xs font-medium text-gray-400 block mb-2">Intervention Mode</label>
          <div className="grid grid-cols-2 gap-2">
            {(['collaborative', 'active_quiz', 'silent_observer', 'paused'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => onSetMode(mode)}
                className={`px-3 py-2 text-xs rounded-xl border capitalize text-left transition-all ${
                  ariaState.mode === mode
                    ? 'bg-aria-purple border-aria-purple-light text-white font-medium'
                    : 'bg-surface-2 border-surface-3 text-gray-300 hover:bg-surface-3'
                }`}
              >
                {mode.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-400 block mb-2">Teacher Directives</label>
          <button
            onClick={onForceIntervene}
            className="w-full py-2.5 bg-gradient-to-r from-aria-purple to-aria-purple-light text-white rounded-xl text-xs font-medium shadow-md hover:opacity-95 active:scale-98 transition-all"
          >
            📢 Ask ARIA to Clarify Concept
          </button>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-400 block mb-2">Detected Learning Gaps</label>
          {learningGaps.length === 0 ? (
            <div className="text-xs text-gray-500 bg-surface-2 p-3 rounded-xl border border-surface-3">
              No repeated gaps detected yet. ARIA is analyzing student questions in real-time.
            </div>
          ) : (
            <div className="space-y-2">
              {learningGaps.map((g, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-surface-2 border border-warning-amber/30 text-xs">
                  <div className="font-semibold text-warning-amber">{g.concept}</div>
                  <div className="text-gray-300 mt-1">{g.description}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
