export const dynamic = 'force-dynamic';

import { z } from 'zod';
import { errorResponse, successResponse } from '@/lib/api';
import { supabaseServer } from '@/services/supabase/server';
import { getGroqClient } from '@/services/groq/groqClient';

const SummaryRequestSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
});

const SummarySchema = z.object({
  overview: z.string(),
  topicsCovered: z.array(z.string()),
  commonLearningGaps: z.array(z.object({
    concept: z.string(),
    description: z.string(),
    affectedStudents: z.array(z.string()),
    recommendation: z.string(),
  })),
  studentInsights: z.array(z.object({
    studentName: z.string(),
    strengths: z.array(z.string()),
    needsSupport: z.array(z.string()),
  })),
  ariaInterventionsCount: z.number(),
  recommendations: z.string(),
});

export async function POST(request: Request) {
  try {
    const appUserId = request.headers.get('x-user-id');
    if (!appUserId) return errorResponse('unauthorized', 'Missing x-user-id header', 401);

    const body = await request.json();
    const data = SummaryRequestSchema.parse(body);

    // Only the teacher may generate or retrieve the summary
    const { data: participant, error: pErr } = await supabaseServer
      .from('participants')
      .select('role')
      .eq('session_id', data.sessionId)
      .eq('app_user_id', appUserId)
      .single();

    if (pErr || participant?.role !== 'teacher') {
      return errorResponse('forbidden', 'Only teachers can access the session summary', 403);
    }

    // Section 8 fix: if summary already exists, return it instead of empty success
    const { data: existingSummary } = await supabaseServer
      .from('session_summaries')
      .select('*')
      .eq('session_id', data.sessionId)
      .single();

    if (existingSummary) {
      return successResponse({ summary: existingSummary, cached: true });
    }

    // Fetch session context for Groq
    const [
      { data: session },
      { data: transcripts },
      { data: ariaEvents },
      { data: learningGaps },
    ] = await Promise.all([
      supabaseServer.from('sessions').select('*, classrooms(*)').eq('id', data.sessionId).single(),
      supabaseServer.from('transcript_segments').select('*').eq('session_id', data.sessionId).order('created_at', { ascending: true }),
      supabaseServer.from('aria_events').select('*').eq('session_id', data.sessionId),
      supabaseServer.from('learning_gaps').select('*').eq('session_id', data.sessionId),
    ]);

    const context = {
      lesson:       session?.classrooms,
      transcripts:  transcripts  ?? [],
      ariaEvents:   ariaEvents   ?? [],
      learningGaps: learningGaps ?? [],
    };

    const groq = getGroqClient();

    const systemMessage = `You are an educational AI assistant. Given the context of a live classroom session, generate a comprehensive summary matching the exact JSON schema. Do not fabricate data not present in the transcript or events.

Schema:
${JSON.stringify({
  overview: 'string',
  topicsCovered: ['string'],
  commonLearningGaps: [{ concept: 'string', description: 'string', affectedStudents: ['string'], recommendation: 'string' }],
  studentInsights: [{ studentName: 'string', strengths: ['string'], needsSupport: ['string'] }],
  ariaInterventionsCount: 'number',
  recommendations: 'string',
})}`;

    const completion = await groq.chat.completions.create({
      model:           'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user',   content: `Context:\n${JSON.stringify(context, null, 2)}` },
      ],
      response_format: { type: 'json_object' },
      temperature:     0.3,
      max_tokens:      2000,
    });

    const rawJson = completion.choices[0]?.message?.content ?? '{}';
    let summaryData;
    try {
      summaryData = SummarySchema.parse(JSON.parse(rawJson));
    } catch (parseErr) {
      console.error('[summary] Groq output parse error', parseErr, rawJson);
      throw new Error('Failed to parse summary output from Groq — check the response format');
    }

    // Upsert to be safe against race conditions
    const { error: upsertErr } = await supabaseServer.from('session_summaries').upsert({
      session_id:              data.sessionId,
      overview:                summaryData.overview,
      topics_covered:          summaryData.topicsCovered,
      common_learning_gaps:    summaryData.commonLearningGaps,
      student_insights:        summaryData.studentInsights,
      aria_interventions_count: summaryData.ariaInterventionsCount,
      recommendations:         summaryData.recommendations,
    }, { onConflict: 'session_id' });

    if (upsertErr) throw new Error(`Failed to save summary: ${upsertErr.message}`);

    // Re-fetch to return the full row (including generated_at etc.)
    const { data: freshSummary } = await supabaseServer
      .from('session_summaries')
      .select('*')
      .eq('session_id', data.sessionId)
      .single();

    return successResponse({ summary: freshSummary, cached: false });

  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return errorResponse('validation_error', (err as any).errors.map((e: any) => e.message).join(', '));
    }
    return errorResponse('internal_error', err instanceof Error ? err.message : 'Unknown error', 500);
  }
}
