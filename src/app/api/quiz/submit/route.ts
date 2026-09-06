export const dynamic = 'force-dynamic';

import { z } from 'zod';
import { errorResponse, successResponse } from '@/lib/api';
import { supabaseServer } from '@/services/supabase/server';

const SubmitQuizSchema = z.object({
  sessionId: z.string().uuid(),
  studentName: z.string().min(1),
  score: z.number(),
  total: z.number(),
});

export async function POST(request: Request) {
  try {
    const appUserId = request.headers.get('x-user-id');
    if (!appUserId) return errorResponse('unauthorized', 'Missing x-user-id header', 401);

    const body = await request.json();
    const data = SubmitQuizSchema.parse(body);

    const { data: participant, error: pErr } = await supabaseServer
      .from('participants')
      .select('role')
      .eq('session_id', data.sessionId)
      .eq('app_user_id', appUserId)
      .single();

    if (pErr || participant?.role !== 'student') {
      return errorResponse('forbidden', 'Only students can submit quiz scores', 403);
    }

    // Insert a chat message as ARIA
    const messageContent = `[Quiz Result] ${data.studentName} scored ${data.score}/${data.total}!`;

    const { error: insertErr } = await supabaseServer
      .from('messages')
      .insert({
        session_id: data.sessionId,
        sender_id: 'system_aria', // Special ID for ARIA
        sender_name: 'ARIA',
        content: messageContent,
      });

    if (insertErr) throw new Error(`Failed to insert message: ${insertErr.message}`);

    return successResponse({ success: true });

  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return errorResponse('validation_error', (err as any).errors.map((e: any) => e.message).join(', '));
    }
    return errorResponse('internal_error', err instanceof Error ? err.message : 'Unknown error', 500);
  }
}
