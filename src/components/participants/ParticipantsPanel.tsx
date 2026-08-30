import { Participant } from '@/types/session';

interface ParticipantsPanelProps {
  participants: Participant[];
  onClose: () => void;
}

export default function ParticipantsPanel({ participants, onClose }: ParticipantsPanelProps) {
  return (
    <div className="w-full sm:w-80 border-l border-surface-3 bg-surface-1 flex flex-col h-full text-white absolute sm:relative z-20">
      <div className="p-4 border-b border-surface-3 flex justify-between items-center">
        <h2 className="font-bold">People ({participants?.length || 0})</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {participants?.map((p) => (
          <div key={p.id} className="flex items-center gap-3 p-2 hover:bg-surface-2 rounded-lg transition-colors">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-gradient-to-br ${p.role === 'teacher' ? 'from-blue-600 to-blue-800' : 'from-green-600 to-green-800'}`}>
              {p.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate text-gray-200">{p.name}</div>
              <div className="text-xs text-gray-500 capitalize">{p.role}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
