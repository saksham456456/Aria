import { ClassroomContext } from '@/types/aria';
import { supabaseServer } from '@/services/supabase/server';

export async function buildClassroomContext(
  sessionId: string,
  ariaMode: 'auto'|'manual'|'silent',
  isTeacherSpeaking: boolean,
  teacherCommand?: string
): Promise<ClassroomContext | null> {
  // Fetch session & classroom info
  const { data: session } = await supabaseServer
    .from('sessions')
    .select('*, classrooms(*)')
    .eq('id', sessionId)
    .single();

  if (!session) return null;

  // Bounded queries
  const [
    { data: participants },
    { data: recentTranscript },
    { data: recentMessages },
    { data: knownLearningGaps },
    { data: recentAriaEvents }
  ] = await Promise.all([
    supabaseServer.from('participants').select('*').eq('session_id', sessionId),
    supabaseServer.from('transcript_segments').select('*').eq('session_id', sessionId).order('created_at', { ascending: false }).limit(20),
    supabaseServer.from('messages').select('*').eq('session_id', sessionId).order('created_at', { ascending: false }).limit(15),
    supabaseServer.from('learning_gaps').select('*').eq('session_id', sessionId),
    supabaseServer.from('aria_events').select('*').eq('session_id', sessionId).order('created_at', { ascending: false }).limit(5)
  ]);

  return {
    lesson: {
      subject: session.classrooms.subject,
      topic: session.classrooms.topic,
      grade: session.classrooms.grade,
      description: session.classrooms.lesson_description,
    },
    participants: participants || [],
    recentTranscript: (recentTranscript || []).reverse(),
    recentMessages: (recentMessages || []).reverse(),
    knownLearningGaps: knownLearningGaps || [],
    recentAriaEvents: recentAriaEvents || [],
    ariaMode,
    isTeacherSpeaking,
    teacherCommand,
  };
}
