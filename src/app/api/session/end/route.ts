export const dynamic = 'force-dynamic';

import { z } from 'zod';
import { supabaseServer } from '@/services/supabase/server';
import { successResponse, errorResponse } from '@/lib/api';

const EndSessionSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
});

export async function POST(request: Request) {
  try {
    const appUserId = request.headers.get('x-user-id');
    if (!appUserId) return errorResponse('unauthorized', 'Missing x-user-id header', 401);

    const body = await request.json();
    const data = EndSessionSchema.parse(body);

    const { data: participant, error: pErr } = await supabaseServer
      .from('participants')
      .select('role')
      .eq('session_id', data.sessionId)
      .eq('app_user_id', appUserId)
      .single();

    if (pErr || participant?.role !== 'teacher') {
      return errorResponse('forbidden', 'Only teachers can end the session', 403);
    }

    const { error: sessionError } = await supabaseServer
      .from('sessions')
      .update({ status: 'ended', ended_at: new Date().toISOString() })
      .eq('id', data.sessionId);

    if (sessionError) throw new Error(`Failed to end session: ${sessionError.message}`);

    return successResponse({ ended: true });

  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return errorResponse('validation_error', (err as any).errors.map((e: any) => e.message).join(', '));
    }
    return errorResponse('internal_error', err instanceof Error ? err.message : String(err), 500);
  }
}
