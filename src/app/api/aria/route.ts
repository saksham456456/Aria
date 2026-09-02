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
        await supabaseServer.from('learning_gaps').upsert(
          gapRows,
          { onConflict: 'session_id,concept' }
        );
      } catch (e) {
        console.error('Failed to upsert learning gaps', e);
      }
    }

    // Map LLM response types to valid DB event_type values
    const EVENT_TYPE_MAP: Record<string, string> = {
      explanation: 'explanation',
      quiz_question: 'quiz',
      clarification: 'explanation',
      encouragement: 'feedback',
      silent_note: 'observation',
      observation: 'observation',
    };
    const eventType = result.shouldSpeak
      ? (EVENT_TYPE_MAP[result.responseType || ''] || 'explanation')
      : 'observation';

    try {
      await supabaseServer.from('aria_events').insert({
        session_id: sessionId,
        event_type: eventType,
        trigger_text: teacherCommand || null,
        response_text: result.response || null,
        urgency: result.urgency ?? null,
        target: result.target || null,
        language: result.language || 'en',
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
