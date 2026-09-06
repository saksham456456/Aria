import { z } from 'zod';

export const AriaResponseSchema = z.object({
  shouldSpeak: z.boolean().default(false),
  urgency: z.coerce.number().min(0).max(10).default(0).optional(),
  target: z.enum(['class', 'student', 'teacher']).default('class').optional(),
  targetStudentName: z.string().default('').optional(),
  language: z.string().default('en').optional(),
  responseType: z.enum(['explanation', 'quiz_question', 'clarification', 'encouragement', 'silent_note', 'observation']).default('explanation').optional(),
  response: z.string().default('').optional(),
  reason: z.string().default('').optional(),
  detectedGaps: z.array(z.object({
    concept: z.string().default(''),
    description: z.string().default(''),
    confidence: z.coerce.number().min(0).max(1).default(0)
  })).default([])
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
