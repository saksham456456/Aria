/* eslint-disable @typescript-eslint/no-explicit-any */
export const dynamic = 'force-dynamic';

import { serverEnv } from '@/lib/env';
import { errorResponse } from '@/lib/api';
import { z } from 'zod';

const TTSRequestSchema = z.object({
  text: z.string().max(500),
});

export async function POST(request: Request) {
  try {
    const appUserId = request.headers.get('x-user-id');
    if (!appUserId) {
      return errorResponse('unauthorized', 'Missing x-user-id header', 401);
    }

    const body = await request.json();
    const data = TTSRequestSchema.parse(body);

    const apiKey = serverEnv.ELEVENLABS_API_KEY;
    const voiceId = serverEnv.ELEVENLABS_VOICE_ID;

    if (!apiKey || !voiceId) {
       return errorResponse('internal_error', 'ElevenLabs credentials not configured', 500);
    }

    const abortController = new AbortController();
    const timeout = setTimeout(() => abortController.abort(), 10000); // 10s timeout

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: data.text,
        model_id: 'eleven_turbo_v2', // or any other fast model
        output_format: 'mp3_44100_128',
      }),
      signal: abortController.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errText = await response.text();
      return errorResponse('tts_error', `ElevenLabs API error: ${errText}`, response.status);
    }

    const audioBuffer = await response.arrayBuffer();

    return new Response(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
      },
    });

  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return errorResponse('validation_error', (err as any).errors.map((e: any) => e.message).join(', '));
    }
    if ((err as Error).name === 'AbortError') {
       return errorResponse('timeout', 'TTS request timed out', 504);
    }
    return errorResponse('internal_error', err instanceof Error ? err.message : String(err), 500);
  }
}
