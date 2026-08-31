export const dynamic = 'force-dynamic';

import { z } from 'zod';
import { supabaseServer } from '@/services/supabase/server';
import { successResponse, errorResponse } from '@/lib/api';

const CreateSessionSchema = z.object({
  name: z.string().min(1).max(100),
  subject: z.string().min(1).max(50),
  topic: z.string().min(1).max(100),
  grade: z.string().min(1).max(20),
  lessonDescription: z.string().min(1).max(1000),
  teacherName: z.string().min(1).max(50),
});

function generateJoinCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function POST(request: Request) {
  try {
    const appUserId = request.headers.get('x-user-id');
    if (!appUserId) {
      return errorResponse('unauthorized', 'Missing x-user-id header', 401);
    }

    const body = await request.json();
    const data = CreateSessionSchema.parse(body);

    const joinCode = generateJoinCode();

    // 1. Create Classroom
    const { data: classroom, error: classroomError } = await supabaseServer
      .from('classrooms')
      .insert({
        name: data.name,
        subject: data.subject,
        topic: data.topic,
        grade: data.grade,
        lesson_description: data.lessonDescription,
        join_code: joinCode,
        teacher_app_user_id: appUserId,
      })
      .select('id')
      .single();

    if (classroomError) throw new Error(`Failed to create classroom: ${classroomError.message}`);

    // 2. Create Session
    const { data: session, error: sessionError } = await supabaseServer
      .from('sessions')
      .insert({
        classroom_id: classroom.id,
        status: 'active',
      })
      .select('id')
      .single();

    if (sessionError) throw new Error(`Failed to create session: ${sessionError.message}`);

    // 3. Create Participant (Teacher)
    const { error: participantError } = await supabaseServer
      .from('participants')
      .insert({
        session_id: session.id,
        app_user_id: appUserId,
        name: data.teacherName,
        role: 'teacher',
      });

    if (participantError) throw new Error(`Failed to create participant: ${participantError.message}`);

    return successResponse({
      sessionId: session.id,
      joinCode: joinCode,
    });

  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return errorResponse('validation_error', err.issues.map((e) => e.message).join(', '));
    }
    return errorResponse('internal_error', err instanceof Error ? err.message : String(err), 500);
  }
}
