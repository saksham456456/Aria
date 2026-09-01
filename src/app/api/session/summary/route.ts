import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

let groq: Groq | null = null;
function getGroq() { if (!groq) groq = new Groq({ apiKey: process.env.GROQ_API_KEY || 'dummy' }); return groq; }

export async function POST(req: NextRequest) {
  try {
    const { sessionData, transcripts, learningGaps } = await req.json();

    const response = await getGroq().chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You are an expert pedagogical analyst. Generate a post-session classroom summary including:
          1. overview (concise narrative)
          2. topics_covered (array of strings)
          3. common_learning_gaps (array of objects with concept, description, affected_students)
          4. student_insights (map of student name to specific progress and suggestions)
          5. recommendations (actionable items for the teacher next class)
          Respond strictly in valid JSON.`
        },
        {
          role: 'user',
          content: `Classroom Session: ${JSON.stringify(sessionData || {})}
          Identified Gaps: ${JSON.stringify(learningGaps || [])}
          Full Transcript:
          ${(transcripts || []).map((t: { speaker_name: string; speaker_role: string; text: string }) => `${t.speaker_name} (${t.speaker_role}): ${t.text}`).join('\n')}`
        }
      ]
    });

    return NextResponse.json(JSON.parse(response.choices[0].message.content || '{}'));
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
