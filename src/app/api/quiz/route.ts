export const dynamic = 'force-dynamic';

import { z } from 'zod';
import { errorResponse, successResponse } from '@/lib/api';
import { supabaseServer } from '@/services/supabase/server';
import { getGroqClient } from '@/services/groq/groqClient';

const QuizRequestSchema = z.object({
  sessionId: z.string().uuid(),
  topic: z.string().min(1, "Topic is required"),
});

const QuizQuestionSchema = z.object({
  question: z.string().default(''),
  options: z.array(z.string()).default([]),
  correctAnswer: z.string().default(''),
  explanation: z.string().default(''),
});

const QuizResponseSchema = z.object({
  questions: z.array(QuizQuestionSchema).default([]),
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

    const groq = getGroqClient();
    const prompt = `You are an expert educator. Generate exactly 3 multiple-choice questions on the topic: "${data.topic}".
Must return JSON matching this schema exactly:
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
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.2,
      });

      const rawContent = completion.choices[0]?.message?.content ?? '{}';
      const parsedJson = JSON.parse(rawContent);

      // Fallback for different JSON structures the LLM might return
      let normalizedJson = parsedJson;
      if (Array.isArray(parsedJson)) {
        normalizedJson = { questions: parsedJson };
      } else if (parsedJson.quiz && Array.isArray(parsedJson.quiz)) {
        normalizedJson = { questions: parsedJson.quiz };
      }

      validatedQuiz = QuizResponseSchema.parse(normalizedJson);
    } catch (apiError) {
      console.error('Groq API failed:', apiError);
      return errorResponse('internal_error', 'Failed to generate quiz from AI provider', 500);
    }

    if (!validatedQuiz.questions || validatedQuiz.questions.length === 0) {
      return errorResponse('internal_error', 'AI could not generate quiz questions for this topic', 500);
    }

    return successResponse({ quiz: validatedQuiz });

  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return errorResponse('validation_error', (err as any).errors.map((e: any) => e.message).join(', '));
    }
    return errorResponse('internal_error', err instanceof Error ? err.message : 'Unknown error', 500);
  }
}
