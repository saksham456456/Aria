export const dynamic = 'force-dynamic';

import { errorResponse, successResponse } from '@/lib/api';
import { supabaseServer } from '@/services/supabase/server';
import { getGroqClient } from '@/services/groq/groqClient';
import { z } from 'zod';

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
    if (!appUserId) {
      return errorResponse('unauthorized', 'Missing x-user-id header', 401);
    }

    const body = await request.json();
    const data = SummaryRequestSchema.parse(body);

    // Verify teacher
    const { data: participant, error: pErr } = await supabaseServer
      .from('participants')
      .select('role')
      .eq('session_id', data.sessionId)
      .eq('app_user_id', appUserId)
      .single();

    if (pErr || participant?.role !== 'teacher') {
      return errorResponse('forbidden', 'Only teachers can generate summaries', 403);
    }

    // Check if summary already exists
    const { data: existingSummary } = await supabaseServer
      .from('session_summaries')
      .select('*')
      .eq('session_id', data.sessionId)
      .single();

    if (existingSummary) {
       return successResponse({ summary: existingSummary, cached: true });
    }

    // Fetch context
    const [
      { data: session },
      { data: transcripts },
      { data: ariaEvents },
      { data: learningGaps }
    ] = await Promise.all([
      supabaseServer.from('sessions').select('*, classrooms(*)').eq('id', data.sessionId).single(),
      supabaseServer.from('transcript_segments').select('*').eq('session_id', data.sessionId).order('created_at', { ascending: true }),
      supabaseServer.from('aria_events').select('*').eq('session_id', data.sessionId),
      supabaseServer.from('learning_gaps').select('*').eq('session_id', data.sessionId)
    ]);

    const context = {
       lesson: session?.classrooms,
       transcripts: transcripts || [],
       ariaEvents: ariaEvents || [],
       learningGaps: learningGaps || []
    };

    const groq = getGroqClient();
    const systemMessage = `You are an educational AI assistant. Given the context of a live classroom session, generate a comprehensive summary matching the exact JSON schema provided. Do not fabricate evidence not found in the transcript/events.
Schema: ${JSON.stringify({
  overview: "string",
  topicsCovered: ["string"],
  commonLearningGaps: [{ concept: "string", description: "string", affectedStudents: ["string"], recommendation: "string" }],
  studentInsights: [{ studentName: "string", strengths: ["string"], needsSupport: ["string"] }],
  ariaInterventionsCount: "number",
  recommendations: "string"
})}
`;

    const userMessage = `Context:\n${JSON.stringify(context, null, 2)}`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userMessage }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 2000,
    });

    const rawJson = completion.choices[0]?.message?.content || '{}';
    let summaryData;

    try {
      summaryData = SummarySchema.parse(JSON.parse(rawJson));
    } catch (err) {
       console.error("Parse error", err, rawJson);
       throw new Error("Failed to parse summary output from Groq");
    }

    // Upsert to ensure no duplicates
    const { data: upsertData, error: upsertErr } = await supabaseServer.from('session_summaries').upsert({
       session_id: data.sessionId,
       overview: summaryData.overview,
       topics_covered: summaryData.topicsCovered,
       common_learning_gaps: summaryData.commonLearningGaps,
       student_insights: summaryData.studentInsights,
       aria_interventions_count: summaryData.ariaInterventionsCount,
       recommendations: summaryData.recommendations,
    }, { onConflict: 'session_id' }).select().single();

    if (upsertErr) throw new Error(`Failed to save summary: ${upsertErr.message}`);

    return successResponse({ success: true, summary: upsertData });

  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
       return errorResponse('validation_error', err.issues.map((e) => e.message).join(', '));
    }
    return errorResponse('internal_error', err instanceof Error ? err.message : String(err), 500);
  }
}
