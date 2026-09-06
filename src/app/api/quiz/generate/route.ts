export const dynamic = 'force-dynamic';

import { z } from 'zod';
import { errorResponse, successResponse } from '@/lib/api';
import { supabaseServer } from '@/services/supabase/server';
import { getGroqClient } from '@/services/groq/groqClient';

const GenerateQuizSchema = z.object({
  sessionId: z.string().uuid(),
  topic: z.string().min(1, 'Topic is required'),
});

const QuizQuestionSchema = z.object({
  question: z.string(),
  options: z.array(z.string()),
  correctAnswer: z.string(),
  explanation: z.string(),
});

const QuizResponseSchema = z.object({
  questions: z.array(QuizQuestionSchema),
});

export async function POST(request: Request) {
  try {
    const appUserId = request.headers.get('x-user-id');
    if (!appUserId) return errorResponse('unauthorized', 'Missing x-user-id header', 401);

    const body = await request.json();
    const data = GenerateQuizSchema.parse(body);

    const { data: participant, error: pErr } = await supabaseServer
      .from('participants')
      .select('role')
      .eq('session_id', data.sessionId)
      .eq('app_user_id', appUserId)
      .single();

    if (pErr || participant?.role !== 'teacher') {
      return errorResponse('forbidden', 'Only teachers can generate quizzes', 403);
    }

    const groq = getGroqClient();
    const systemMessage = `You are an AI teacher. Generate a 3-question multiple-choice pop quiz about: "${data.topic}".
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

    let validatedQuiz;
    try {
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'system', content: systemMessage }],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      });

      const rawContent = completion.choices[0]?.message?.content ?? '{}';
      const parsedJson = JSON.parse(rawContent);
      validatedQuiz = QuizResponseSchema.parse(parsedJson);
    } catch (apiError) {
      console.error('Groq API failed:', apiError);
      return errorResponse('internal_error', 'Failed to generate quiz from AI provider', 500);
    }

    return successResponse({ quiz: validatedQuiz });

  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return errorResponse('validation_error', err.errors.map(e => e.message).join(', '));
    }
    return errorResponse('internal_error', err instanceof Error ? err.message : 'Unknown error', 500);
  }
}
