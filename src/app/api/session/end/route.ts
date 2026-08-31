export const dynamic = 'force-dynamic';

import { errorResponse, successResponse } from '@/lib/api';
import { supabaseServer } from '@/services/supabase/server';
import { z } from 'zod';

const EndSessionSchema = z.object({
  sessionId: z.string().uuid(),
});

export async function POST(request: Request) {
  try {
    const appUserId = request.headers.get('x-user-id');
    if (!appUserId) {
      return errorResponse('unauthorized', 'Missing x-user-id header', 401);
    }

    const body = await request.json();
    const data = EndSessionSchema.parse(body);

    // Verify teacher
    const { data: participant, error: pErr } = await supabaseServer
      .from('participants')
      .select('role')
      .eq('session_id', data.sessionId)
      .eq('app_user_id', appUserId)
      .single();

    if (pErr || participant?.role !== 'teacher') {
      return errorResponse('forbidden', 'Only teachers can end the session', 403);
    }

    // Update session status
    const { error: sessionError } = await supabaseServer
      .from('sessions')
      .update({ status: 'ended', ended_at: new Date().toISOString() })
      .eq('id', data.sessionId);

    if (sessionError) throw new Error(`Failed to end session: ${sessionError.message}`);

    // In a real scenario, we might trigger /api/summary async here
    // fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/summary`, { method: 'POST', ... }).catch(console.error);

    return successResponse({ success: true });

  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
       return errorResponse('validation_error', err.issues.map((e) => e.message).join(', '));
    }
    return errorResponse('internal_error', err instanceof Error ? err.message : String(err), 500);
  }
}
