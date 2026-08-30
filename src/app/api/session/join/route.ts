/* eslint-disable @typescript-eslint/no-explicit-any */
export const dynamic = 'force-dynamic';


import { z } from 'zod';
import { supabaseServer } from '@/services/supabase/server';
import { successResponse, errorResponse } from '@/lib/api';

const JoinSessionSchema = z.object({
  joinCode: z.string().length(6),
  name: z.string().min(1).max(50),
  learningLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  language: z.enum(['en', 'hi', 'en+hi']).optional(),
});

export async function POST(request: Request) {
  try {
    const appUserId = request.headers.get('x-user-id');
    if (!appUserId) {
      return errorResponse('unauthorized', 'Missing x-user-id header', 401);
    }

    const body = await request.json();
    const data = JoinSessionSchema.parse(body);

    // 1. Find classroom by join_code
    const { data: classroom, error: classroomError } = await supabaseServer
      .from('classrooms')
      .select('id')
      .eq('join_code', data.joinCode.toUpperCase())
      .single();

    if (classroomError || !classroom) {
      return errorResponse('not_found', 'Classroom not found or invalid code', 404);
    }

    // 2. Find active session for classroom
    const { data: session, error: sessionError } = await supabaseServer
      .from('sessions')
      .select('id, status')
      .eq('classroom_id', classroom.id)
      .eq('status', 'active')
      .single();

    if (sessionError || !session) {
      return errorResponse('not_active', 'No active session found for this classroom', 404);
    }

    // 3. Upsert Participant (Student)
    // If they already joined this session, update their info
    const { error: participantError } = await supabaseServer
      .from('participants')
      .upsert({
        session_id: session.id,
        app_user_id: appUserId,
        name: data.name,
        role: 'student',
        learning_level: data.learningLevel,
        language: data.language,
      }, { onConflict: 'session_id,app_user_id' });

    if (participantError) throw new Error(`Failed to create participant: ${participantError.message}`);

    return successResponse({
      sessionId: session.id,
    });

  } catch (err: unknown) {
    if (err instanceof z.ZodError) {

      return errorResponse('validation_error', (err as any).errors.map((e: any) => e.message).join(', '));
    }
    return errorResponse('internal_error', err instanceof Error ? err.message : String(err), 500);
  }
}
