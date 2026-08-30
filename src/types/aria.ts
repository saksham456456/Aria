/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from 'zod';

export const AriaResponseSchema = z.object({
  shouldSpeak: z.boolean(),
  urgency: z.number().int().min(0).max(10),
  target: z.enum(['class', 'teacher']).or(z.string()),
  language: z.enum(['en', 'hi', 'en+hi']),
  responseType: z.enum(['explanation', 'quiz', 'summary', 'feedback', 'observation']),
  response: z.string().max(500),      // what ARIA will say aloud
  reason: z.string().max(300),        // internal reasoning (not spoken)
  learningGaps: z.array(z.object({
    concept: z.string(),
    affectedStudentIds: z.array(z.string()),
    confidence: z.number().min(0).max(1),
    evidence: z.string(),
  })).optional(),
});

export type AriaResponse = z.infer<typeof AriaResponseSchema>;

export interface ClassroomContext {
  lesson: { subject: string; topic: string; grade: string; description: string };
  participants: any[];
  recentTranscript: any[];
  recentMessages: any[];
  knownLearningGaps: any[];
  recentAriaEvents: any[];
  ariaMode: 'auto' | 'manual' | 'silent';
  isTeacherSpeaking: boolean;
  teacherCommand?: string;
}
