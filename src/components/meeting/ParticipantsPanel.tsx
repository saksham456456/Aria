'use client';

import { Participant } from '@/types/session';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, UserRound, GraduationCap } from 'lucide-react';

interface ParticipantsPanelProps {
  participants: Participant[];
  onClose: () => void;
}

export default function ParticipantsPanel({ participants, onClose }: ParticipantsPanelProps) {
  const teacher = participants.find(p => p.role === 'teacher');
  const students = participants.filter(p => p.role === 'student');

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-200">
      <div className="h-14 border-b border-zinc-800 flex items-center justify-between px-4">
        <h2 className="font-semibold text-sm">Participants ({participants.length})</h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-zinc-400 hover:text-zinc-100">
          <X className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">

          {teacher && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Teacher</h3>
              <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-900/30 flex items-center justify-center">
                    <GraduationCap className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className="text-sm font-medium">{teacher.name}</span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Students ({students.length})</h3>
            <div className="space-y-2">
              {students.map(student => (
                <div key={student.id} className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/50 border border-zinc-800/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                      <UserRound className="w-4 h-4 text-zinc-500" />
                    </div>
                    <div>
                      <div className="text-sm font-medium leading-none">{student.name}</div>
                      <div className="text-[10px] text-zinc-500 mt-1 capitalize">
                        {student.learning_level || 'Intermediate'} • {student.language === 'en+hi' ? 'En/Hi' : student.language?.toUpperCase() || 'EN'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {students.length === 0 && (
                <div className="text-sm text-zinc-500 text-center py-4">No students have joined yet.</div>
              )}
            </div>
          </div>

        </div>
      </ScrollArea>
    </div>
  );
}
