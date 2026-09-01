'use client';

import { Participant } from '@/types/session';

const ROLE_BADGE: Record<string, string> = {
  teacher: 'bg-role-teacher/10 text-role-teacher border-role-teacher/20',
  student: 'bg-role-student/10 text-role-student border-role-student/20',
};

interface ParticipantsPanelProps {
  participants: Participant[];
  onClose:      () => void;
}

export default function ParticipantsPanel({ participants, onClose }: ParticipantsPanelProps) {
  const teacher  = participants.filter(p => p.role === 'teacher');
  const students = participants.filter(p => p.role === 'student');

  return (
    <div className="w-72 shrink-0 border-l border-surface-3 bg-surface-1 flex flex-col h-full animate-slide-in-right">
      <div className="h-14 px-4 flex items-center justify-between border-b border-surface-3 shrink-0">
        <h2 className="text-sm font-semibold text-white">
          People <span className="text-slate-500 font-normal">({participants.length})</span>
        </h2>
        <button onClick={onClose} className="text-slate-400 hover:text-white text-lg leading-none">&times;</button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {teacher.length > 0 && (
          <section>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-2 px-1">Instructor</p>
            <div className="space-y-1">
              {teacher.map(p => <ParticipantRow key={p.id} participant={p} />)}
            </div>
          </section>
        )}
        {students.length > 0 && (
          <section>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-2 px-1">
              Students ({students.length})
            </p>
            <div className="space-y-1">
              {students.map(p => <ParticipantRow key={p.id} participant={p} />)}
            </div>
          </section>
        )}
        {participants.length === 0 && (
          <p className="text-slate-500 text-xs text-center py-8">No participants yet.</p>
        )}
      </div>
    </div>
  );
}

function ParticipantRow({ participant: p }: { participant: Participant }) {
  const initial = p.name.charAt(0).toUpperCase();
  return (
    <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-surface-2 transition-colors">
      <div className="w-8 h-8 rounded-full bg-surface-3 flex items-center justify-center text-xs font-semibold text-white shrink-0">
        {initial}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-white truncate font-medium">{p.name}</p>
        {p.learning_level && (
          <p className="text-[10px] text-slate-500 capitalize">{p.learning_level}</p>
        )}
      </div>
      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border capitalize shrink-0 ${ROLE_BADGE[p.role]}`}>
        {p.role}
      </span>
    </div>
  );
}
