import { NextRequest } from 'next/server';
import { supabaseServer } from '@/services/supabase/server';
import { z } from 'zod';
import { errorResponse, successResponse } from '@/lib/api';

const TranscriptSchema = z.object({
  session_id: z.string().uuid(),
  participant_id: z.string().uuid(),
  speaker_role: z.string(),
  speaker_name: z.string(),
  text: z.string(),
  start_time: z.string(),
  end_time: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = TranscriptSchema.parse(body);

    const { error } = await supabaseServer.from('transcript_segments').insert(data);
    
    if (error) {
      console.error('[Transcript API] Insert error:', error);
      return errorResponse('db_error', error.message, 500);
    }

    return successResponse({ success: true });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return errorResponse('validation_error', (err as any).errors.map((e: any) => e.message).join(', '));
    }
    return errorResponse('internal_error', err instanceof Error ? err.message : 'Unknown error', 500);
  }
}
