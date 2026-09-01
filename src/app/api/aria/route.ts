export const dynamic = 'force-dynamic';

import { z } from 'zod';
import { supabaseServer } from '@/services/supabase/server';
import { buildClassroomContext } from '@/services/aria/contextBuilder';
import { evaluateContext } from '@/services/aria/ariaEngine';
import { successResponse, errorResponse } from '@/lib/api';

const AriaRequestSchema = z.object({
  sessionId:        z.string().uuid('Invalid session ID'),
  ariaMode:         z.enum(['auto', 'manual', 'silent']),
  isTeacherSpeaking: z.boolean(),
  teacherCommand:   z.string().optional(),
});

export async function POST(request: Request) {
  try {
    // Section 17.1 — authorization check
    const appUserId = request.headers.get('x-user-id');
    if (!appUserId) return errorResponse('unauthorized', 'Missing x-user-id header', 401);

    const body = await request.json();
    const data = AriaRequestSchema.parse(body);

    // Verify the caller is the teacher for this session
    const { data: participant, error: pErr } = await supabaseServer
      .from('participants')
      .select('role')
      .eq('session_id', data.sessionId)
      .eq('app_user_id', appUserId)
      .single();

    if (pErr || !participant) {
      return errorResponse('forbidden', 'Not a participant in this session', 403);
    }
    if (participant.role !== 'teacher') {
      return errorResponse('forbidden', 'Only the teacher can trigger ARIA evaluation', 403);
    }

    const context = await buildClassroomContext(
      data.sessionId,
      data.ariaMode,
      data.isTeacherSpeaking,
      data.teacherCommand
    );

    if (!context) return errorResponse('not_found', 'Session not found', 404);

    const ariaDecision = await evaluateContext(context);

    if (ariaDecision.learningGaps && ariaDecision.learningGaps.length > 0) {
      for (const gap of ariaDecision.learningGaps) {
        await supabaseServer.from('learning_gaps').upsert({
          session_id:           data.sessionId,
          concept:              gap.concept,
          description:          gap.evidence,
          affected_student_ids: gap.affectedStudentIds,
          confidence:           gap.confidence,
          evidence:             gap.evidence,
        }, { onConflict: 'session_id,concept' });
      }
    }

    if (ariaDecision.shouldSpeak || ariaDecision.responseType === 'observation') {
      await supabaseServer.from('aria_events').insert({
        session_id:    data.sessionId,
        event_type:    ariaDecision.responseType,
        response_text: ariaDecision.response,
        urgency:       ariaDecision.urgency,
        target:        ariaDecision.target,
        language:      ariaDecision.language,
      });
    }

    return successResponse(ariaDecision);

  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return errorResponse('validation_error', err.message);
    }
    return errorResponse('internal_error', err instanceof Error ? err.message : 'Unknown error', 500);
  }
}
