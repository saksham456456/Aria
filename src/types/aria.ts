import { z } from 'zod';

export const AriaResponseSchema = z.object({
  shouldSpeak: z.boolean(),
  urgency: z.number().min(0).max(10).optional(),
  target: z.enum(['class', 'student', 'teacher']).optional(),
  targetStudentName: z.string().optional(),
  language: z.string().default('en').optional(),
  responseType: z.enum(['explanation', 'quiz_question', 'clarification', 'encouragement', 'silent_note', 'observation']).optional(),
  response: z.string().optional(),
  reason: z.string().optional(),
  detectedGaps: z.array(z.object({
    concept: z.string(),
    description: z.string(),
    confidence: z.number().min(0).max(1)
  })).optional()
});

export type AriaLLMResponse = z.infer<typeof AriaResponseSchema>;

export interface ClassroomContext {
  lesson: { subject: string; topic: string; grade: string; description: string };
  participants: Record<string, unknown>[];
  recentTranscript: Record<string, unknown>[];
  recentMessages: Record<string, unknown>[];
  knownLearningGaps: Record<string, unknown>[];
  recentAriaEvents: Record<string, unknown>[];
  ariaMode: 'auto' | 'manual' | 'silent' | 'collaborative' | 'active_quiz' | 'silent_observer' | 'paused';
  isTeacherSpeaking: boolean;
  teacherCommand?: string;
}

export type AriaResponse = AriaLLMResponse;
