export const dynamic = 'force-dynamic';

import { z } from 'zod';
import { errorResponse, successResponse } from '@/lib/api';
import { supabaseServer } from '@/services/supabase/server';
import { getGroqClient } from '@/services/groq/groqClient';

const CustomSummarySchema = z.object({
  sessionId: z.string().uuid(),
  topics: z.string().min(1),
  saveToDb: z.boolean().default(false),
});

const SummaryResponseSchema = z.object({
  overview: z.string(),
  topics_covered: z.array(z.string()),
  key_points: z.array(z.string()),
});

export async function POST(request: Request) {
  try {
    const appUserId = request.headers.get('x-user-id');
    if (!appUserId) return errorResponse('unauthorized', 'Missing x-user-id header', 401);

    const body = await request.json();
    const data = CustomSummarySchema.parse(body);

    const { data: participant, error: pErr } = await supabaseServer
      .from('participants')
      .select('role')
      .eq('session_id', data.sessionId)
      .eq('app_user_id', appUserId)
      .single();

    if (pErr || participant?.role !== 'teacher') {
      return errorResponse('forbidden', 'Only teachers can generate summaries', 403);
    }

    const groq = getGroqClient();
    const systemMessage = `You are an AI teacher assistant. Generate a class summary based on these topics: "${data.topics}".
Must return JSON matching this schema:
{
  "overview": "string (1-2 sentences)",
  "topics_covered": ["string", "string"],
  "key_points": ["string", "string", "string"]
}`;

    let validatedSummary;
    try {
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'system', content: systemMessage }],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      });

      const rawContent = completion.choices[0]?.message?.content ?? '{}';
      const parsedJson = JSON.parse(rawContent);
      validatedSummary = SummaryResponseSchema.parse(parsedJson);
    } catch (apiError) {
      console.error('Groq API failed:', apiError);
      return errorResponse('internal_error', 'Failed to generate summary', 500);
    }

    if (data.saveToDb) {
      const { error: upsertErr } = await supabaseServer
        .from('session_summaries')
        .upsert({
          session_id: data.sessionId,
          overview: validatedSummary.overview,
          topics_covered: validatedSummary.topics_covered,
          recommendations: validatedSummary.key_points.join('\n\n'), // repurposing this field for key points
          aria_interventions_count: 0,
          common_learning_gaps: [],
          student_insights: []
        }, { onConflict: 'session_id' });

      if (upsertErr) {
        console.error('Failed to save summary:', upsertErr);
        return errorResponse('internal_error', 'Failed to save summary', 500);
      }
    }

    return successResponse({ summary: validatedSummary });

  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return errorResponse('validation_error', (err as any).errors.map((e: any) => e.message).join(', '));
    }
    return errorResponse('internal_error', err instanceof Error ? err.message : 'Unknown error', 500);
  }
}
