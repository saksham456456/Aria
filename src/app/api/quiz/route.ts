export const dynamic = 'force-dynamic';

import { z } from 'zod';
import { errorResponse, successResponse } from '@/lib/api';
import { supabaseServer } from '@/services/supabase/server';
import { getGroqClient } from '@/services/groq/groqClient';

const QuizRequestSchema = z.object({
  sessionId: z.string().uuid(),
});

export async function POST(request: Request) {
  try {
    const appUserId = request.headers.get('x-user-id');
    if (!appUserId) return errorResponse('unauthorized', 'Missing x-user-id header', 401);

    const body = await request.json();
    const data = QuizRequestSchema.parse(body);

    // Only teachers can generate quizzes
    const { data: participant, error: pErr } = await supabaseServer
      .from('participants')
      .select('role')
      .eq('session_id', data.sessionId)
      .eq('app_user_id', appUserId)
      .single();

    if (pErr || participant?.role !== 'teacher') {
      return errorResponse('forbidden', 'Only teachers can generate quizzes', 403);
    }

    // Get last 5 minutes of transcript
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data: transcripts } = await supabaseServer
      .from('transcript_segments')
      .select('speaker_name, text')
      .eq('session_id', data.sessionId)
      .gte('created_at', fiveMinutesAgo)
      .order('created_at', { ascending: true });

    let transcriptData = transcripts;
    if (!transcripts || transcripts.length === 0) {
      return errorResponse('bad_request', 'Not enough conversation data to generate a quiz', 400);
    }

    const groq = getGroqClient();
    const systemMessage = `You are an AI teacher. Generate a 3-question multiple-choice pop quiz based EXACTLY on the transcript provided. 
Must return JSON matching this schema:
{
  "questions": [
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correctAnswer": "string (must exactly match one option)",
      "explanation": "string (why is it correct?)"
    }
  ]
}`;

    let quizContent;

    try {
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: JSON.stringify(transcriptData) }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      });
      quizContent = JSON.parse(completion.choices[0]?.message?.content ?? '{"questions": []}');
    } catch (apiError) {
      console.error('Groq API failed:', apiError);
      return errorResponse('internal_error', 'Failed to generate quiz from AI provider', 500);
    }

    // Return the quiz to the client so the teacher's browser can securely broadcast it
    // Serverless environments often kill WebSockets before 'SUBSCRIBED' fires
    return successResponse({ quiz: quizContent });

  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return errorResponse('validation_error', (err as any).errors.map((e: any) => e.message).join(', '));
    }
    return errorResponse('internal_error', err instanceof Error ? err.message : 'Unknown error', 500);
  }
}
