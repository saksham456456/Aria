export type ParticipantRole = 'teacher' | 'student' | 'aria';
export type LearningLevel = 'beginner' | 'intermediate' | 'advanced';
export type SessionStatus = 'active' | 'ending' | 'ended';

export interface Participant {
  id: string;
  session_id: string;
  app_user_id: string;
  name: string;
  role: ParticipantRole;
  learning_level?: LearningLevel;
  language?: string;
  is_muted?: boolean;
  is_camera_off?: boolean;
  is_speaking?: boolean;
  joined_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  participant_id?: string;
  role: ParticipantRole;
  sender_name: string;
  text: string;
  created_at: string;
}

export interface TranscriptSegment {
  id?: string;
  session_id: string;
  participant_id?: string;
  speaker_role: ParticipantRole;
  speaker_name: string;
  text: string;
  language?: string;
  created_at?: string;
}

export interface LearningGap {
  id?: string;
  session_id: string;
  concept: string;
  description: string;
  affected_student_ids: string[];
  confidence: number;
  evidence: string;
}

export interface AriaState {
  isListening: boolean;
  isEvaluating: boolean;
  isSpeaking: boolean;
  currentResponse: string | null;
  mode: 'collaborative' | 'active_quiz' | 'silent_observer' | 'paused';
  sensitivity: 'low' | 'medium' | 'high';
}
