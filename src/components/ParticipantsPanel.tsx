import React from 'react';
import { Participant } from '@/types/meeting';

interface ParticipantsPanelProps {
  participants: Participant[];
  localUser: { id: string; name: string; role: string };
  onClose: () => void;
}

export const ParticipantsPanel: React.FC<ParticipantsPanelProps> = ({ participants, localUser, onClose }) => {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-surface-3 flex items-center justify-between">
        <h2 className="font-semibold text-sm text-white">Participants</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white text-lg">×</button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-2">
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-2 border border-aria-purple/30">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-aria-purple flex items-center justify-center text-xs font-bold text-white">
              A
            </div>
            <div>
              <div className="text-xs font-semibold text-white">ARIA</div>
              <div className="text-[10px] text-aria-purple-light">AI Co-Teacher</div>
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-role-aria animate-pulse" />
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-2 border border-surface-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-surface-3 flex items-center justify-center text-xs font-bold text-white">
              {localUser.name[0]}
            </div>
            <div>
              <div className="text-xs font-semibold text-white">{localUser.name} (You)</div>
              <div className="text-[10px] text-gray-400 capitalize">{localUser.role}</div>
            </div>
          </div>
        </div>

        {participants.map((p) => (
          <div key={p.id} className="flex items-center justify-between p-2.5 rounded-xl bg-surface-2 border border-surface-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-surface-3 flex items-center justify-center text-xs font-bold text-white">
                {p.name[0]}
              </div>
              <div>
                <div className="text-xs font-semibold text-white">{p.name}</div>
                <div className="text-[10px] text-gray-400 capitalize">{p.role}</div>
              </div>
            </div>
            {p.learning_level && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-surface-3 text-gray-300">
                {p.learning_level}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
