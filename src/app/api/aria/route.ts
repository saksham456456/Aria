import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { AriaResponseSchema } from '@/types/aria';

let groq: Groq | null = null;
function getGroq() { if (!groq) groq = new Groq({ apiKey: process.env.GROQ_API_KEY || 'dummy' }); return groq; }

export async function POST(req: NextRequest) {
  try {
    const {
      lessonContext,
      recentTranscripts,
      participants,
      ariaMode = 'collaborative',
      teacherMutedAI = false
    } = await req.json();

    if (teacherMutedAI || ariaMode === 'silent_observer' || ariaMode === 'paused') {
      return NextResponse.json({ shouldSpeak: false, reason: 'AI disabled or in silent mode' });
    }

    const systemPrompt = `
You are ARIA, an intelligent, empathetic voice AI co-teacher in a live classroom.
Subject: ${lessonContext?.subject || 'General'}
Topic: ${lessonContext?.topic || 'General'}
Grade: ${lessonContext?.grade || 'Standard'}
Description: ${lessonContext?.lesson_description || 'General Lesson'}

Current Mode: ${ariaMode}
Active Participants: ${JSON.stringify(participants || [])}

Turn-taking Rules:
1. NEVER talk over the teacher. Only intervene if the teacher has finished a point, asked for assistance, or if students are visibly confused.
2. If a student is confused about a concept, provide a gentle, step-by-step intuition without shaming them.
3. Code-switch smoothly if students speak Hinglish or regional phrases.
4. Output valid JSON adhering strictly to the required schema.
`;

    // Ensure recentTranscripts is an array
    const transcriptText = (recentTranscripts || []).map((t: { speaker_name: string; speaker_role: string; text: string }) => `${t.speaker_name} (${t.speaker_role}): ${t.text}`).join('\n');

    const response = await getGroq().chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Recent Classroom Conversation:\n${transcriptText}\n\nEvaluate if you should speak now. Respond in JSON.`
        }
      ],
      temperature: 0.3
    });

    const parsed = AriaResponseSchema.parse(JSON.parse(response.choices[0].message.content || '{}'));
    return NextResponse.json(parsed);
  } catch (error: unknown) {
    return NextResponse.json({ shouldSpeak: false, error: (error as Error).message }, { status: 500 });
  }
}
