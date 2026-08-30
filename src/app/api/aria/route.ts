/* eslint-disable @typescript-eslint/no-explicit-any */
export const dynamic = 'force-dynamic';


import { z } from 'zod';
import { supabaseServer } from '@/services/supabase/server';
import { buildClassroomContext } from '@/services/aria/contextBuilder';
import { evaluateContext } from '@/services/aria/ariaEngine';
import { successResponse, errorResponse } from '@/lib/api';

const AriaRequestSchema = z.object({
  sessionId: z.string().uuid(),
  ariaMode: z.enum(['auto', 'manual', 'silent']),
  isTeacherSpeaking: z.boolean(),
  teacherCommand: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = AriaRequestSchema.parse(body);

    const context = await buildClassroomContext(
      data.sessionId,
      data.ariaMode,
      data.isTeacherSpeaking,
      data.teacherCommand
    );

    if (!context) {
      return errorResponse('not_found', 'Session not found', 404);
    }

    const ariaDecision = await evaluateContext(context);

    // Save learning gaps
    if (ariaDecision.learningGaps && ariaDecision.learningGaps.length > 0) {
      for (const gap of ariaDecision.learningGaps) {
        await supabaseServer.from('learning_gaps').upsert({
          session_id: data.sessionId,
          concept: gap.concept,
          description: gap.evidence, // simplified
          affected_student_ids: gap.affectedStudentIds,
          confidence: gap.confidence,
          evidence: gap.evidence,
        }, { onConflict: 'session_id,concept' });
      }
    }

    // Save event if it decided to speak or it's an observation
    if (ariaDecision.shouldSpeak || ariaDecision.responseType === 'observation') {
       await supabaseServer.from('aria_events').insert({
         session_id: data.sessionId,
         event_type: ariaDecision.responseType,
         response_text: ariaDecision.response,
         urgency: ariaDecision.urgency,
         target: ariaDecision.target,
         language: ariaDecision.language,
       });
    }

    return successResponse(ariaDecision);

  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return errorResponse('validation_error', (err as any).errors.map((e: any) => e.message).join(', '));
    }
    return errorResponse('internal_error', err instanceof Error ? err.message : String(err), 500);
  }
}
