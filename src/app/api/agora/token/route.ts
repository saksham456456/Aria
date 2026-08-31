export const dynamic = 'force-dynamic';

import { RtcTokenBuilder, RtcRole } from 'agora-token';
import { supabaseServer } from '@/services/supabase/server';
import { serverEnv } from '@/lib/env';
import { errorResponse, successResponse } from '@/lib/api';
import { z } from 'zod';

const TokenRequestSchema = z.object({
  sessionId: z.string().uuid(),
});

export async function POST(request: Request) {
  try {
    const appUserId = request.headers.get('x-user-id');
    if (!appUserId) {
      return errorResponse('unauthorized', 'Missing x-user-id header', 401);
    }

    const body = await request.json();
    const data = TokenRequestSchema.parse(body);

    // Validate session and participant
    const { data: participant, error: pErr } = await supabaseServer
      .from('participants')
      .select('id, role')
      .eq('session_id', data.sessionId)
      .eq('app_user_id', appUserId)
      .single();

    if (pErr || !participant) {
      return errorResponse('forbidden', 'Not a participant in this session', 403);
    }

    const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
    const appCertificate = serverEnv.AGORA_APP_CERTIFICATE;

    if (!appId || !appCertificate) {
       return errorResponse('internal_error', 'Agora credentials not configured', 500);
    }

    const role = RtcRole.PUBLISHER; // Everyone publishes
    const expirationTimeInSeconds = 3600;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    // Use appUserId as string UID for Agora
    const token = RtcTokenBuilder.buildTokenWithUserAccount(
      appId,
      appCertificate,
      data.sessionId,
      appUserId,
      role,
      privilegeExpiredTs,
      privilegeExpiredTs
    );

    return successResponse({ token });

  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return errorResponse('validation_error', err.issues.map((e) => e.message).join(', '));
    }
    return errorResponse('internal_error', err instanceof Error ? err.message : String(err), 500);
  }
}
