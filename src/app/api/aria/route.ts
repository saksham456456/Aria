export const dynamic = 'force-dynamic';

import { successResponse, errorResponse } from '@/lib/api';
import { buildClassroomContext } from '@/services/aria/contextBuilder';
import { evaluateContext } from '@/services/aria/ariaEngine';
import { supabaseServer } from '@/services/supabase/server';

export async function POST(request: Request) {
  try {
    const appUserId = request.headers.get('x-user-id');
    if (!appUserId) return errorResponse('unauthorized', 'Missing x-user-id header', 401);

    const { sessionId, ariaMode = 'auto', isTeacherSpeaking = false, teacherCommand } = await request.json();

    if (!sessionId) return errorResponse('bad_request', 'sessionId is required', 400);

    // Early exit for silent/paused modes (unless teacher command overrides)
    if ((ariaMode === 'silent' || ariaMode === 'paused') && !teacherCommand) {
      return successResponse({ shouldSpeak: false, reason: 'AI is in silent/paused mode' });
    }

    // Build full classroom context from Supabase
    const context = await buildClassroomContext(sessionId, ariaMode, isTeacherSpeaking, teacherCommand);
    if (!context) {
      return errorResponse('not_found', 'Session not found', 404);
    }

    // Evaluate with Groq LLM
    const result = await evaluateContext(context);

    // Persist learning gaps if detected
    if (result.detectedGaps && result.detectedGaps.length > 0) {
      const gapRows = result.detectedGaps.map(g => ({
        session_id: sessionId,
        concept: g.concept,
        description: g.description,
        confidence: g.confidence,
        affected_student_ids: [],
        evidence: `Detected during ARIA evaluation`,
      }));
      try {
        await supabaseServer.from('learning_gaps').insert(gapRows).throwOnError();
      } catch (e) {
        console.error('Failed to insert learning gaps', e);
      }
    }

    try {
      await supabaseServer.from('aria_events').insert({
        session_id: sessionId,
        event_type: result.shouldSpeak ? (result.responseType || 'explanation') : 'silent_observation',
        data: {
          shouldSpeak: result.shouldSpeak,
          response: result.response,
          reason: result.reason,
          target: result.target,
          urgency: result.urgency,
        },
      });
    } catch (e) {
      console.error('Failed to log ARIA event', e);
    }

    return successResponse(result);

  } catch (err: unknown) {
    console.error('[ARIA] evaluation error', err);
    return errorResponse('internal_error', err instanceof Error ? err.message : 'Unknown error', 500);
  }
}
