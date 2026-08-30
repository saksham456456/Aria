export interface Classroom {
  id: string;
  name: string;
  subject: string;
  topic: string;
  grade: string;
  lesson_description: string;
  join_code: string;
  teacher_app_user_id: string;
  created_at: string;
}

export interface Session {
  id: string;
  classroom_id: string;
  classrooms: Classroom;
  status: 'active' | 'ending' | 'ended';
  started_at: string;
  ended_at: string | null;
  created_at: string;
}

export interface Participant {
  id: string;
  session_id: string;
  app_user_id: string;
  name: string;
  role: 'teacher' | 'student';
  learning_level: 'beginner' | 'intermediate' | 'advanced' | null;
  language: 'en' | 'hi' | 'en+hi' | null;
  joined_at: string;
  left_at: string | null;
}

export interface Message {
  id: string;
  session_id: string;
  participant_id: string | null;
  role: 'teacher' | 'student' | 'aria';
  sender_name: string;
  text: string;
  created_at: string;
}

export interface TranscriptSegment {
  id: string;
  session_id: string;
  participant_id: string | null;
  speaker_role: string;
  speaker_name: string;
  text: string;
  language: string | null;
  start_time: string | null;
  end_time: string | null;
  created_at: string;
}
