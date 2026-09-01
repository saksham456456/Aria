export const dynamic = 'force-dynamic';

import { z } from 'zod';
import { supabaseServer } from '@/services/supabase/server';
import { successResponse, errorResponse } from '@/lib/api';

const JoinSessionSchema = z.object({
  // Section 17.2 — enforce exactly 6 uppercase alphanumeric chars
  joinCode:      z.string().length(6).regex(/^[A-Z0-9]{6}$/, 'Invalid join code format'),
  name:          z.string().min(1).max(50),
  learningLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  language:      z.enum(['en', 'hi', 'en+hi']).optional(),
});

export async function POST(request: Request) {
  try {
    const appUserId = request.headers.get('x-user-id');
    if (!appUserId) return errorResponse('unauthorized', 'Missing x-user-id header', 401);

    const body = await request.json();
    // Normalise before validation
    if (typeof body.joinCode === 'string') body.joinCode = body.joinCode.toUpperCase().trim();
    const data = JoinSessionSchema.parse(body);

    const { data: classroom, error: classroomError } = await supabaseServer
      .from('classrooms')
      .select('id')
      .eq('join_code', data.joinCode)
      .single();

    if (classroomError || !classroom) {
      return errorResponse('not_found', 'Classroom not found. Check the code and try again.', 404);
    }

    const { data: session, error: sessionError } = await supabaseServer
      .from('sessions')
      .select('id, status')
      .eq('classroom_id', classroom.id)
      .eq('status', 'active')
      .single();

    if (sessionError || !session) {
      return errorResponse('not_active', 'No active session for this classroom. Ask your teacher to start one.', 404);
    }

    const { error: participantError } = await supabaseServer
      .from('participants')
      .upsert(
        {
          session_id:    session.id,
          app_user_id:   appUserId,
          name:          data.name,
          role:          'student',
          learning_level: data.learningLevel,
          language:      data.language,
        },
        { onConflict: 'session_id,app_user_id' }
      );

    if (participantError) throw new Error(`Failed to register participant: ${participantError.message}`);

    return successResponse({ sessionId: session.id });

  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return errorResponse('validation_error', err.message);
    }
    return errorResponse('internal_error', err instanceof Error ? err.message : String(err), 500);
  }
}
