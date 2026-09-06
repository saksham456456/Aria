import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/services/supabase/server';
import { hashUid } from '@/lib/uid';
import {
  AgoraClient,
  Agent,
  Area,
  DeepgramSTT,
  ExpiresIn,
  MiniMaxTTS,
  OpenAI,
} from 'agora-agents';

interface ClientStartRequest {
  requester_id: string;
  channel_name: string;
  additional_uids?: string[];
}

interface AgentResponse {
  agent_id: string;
  create_ts: number;
  state: string;
}

function buildDynamicSystemPrompt({
  teacherName,
  studentNames,
  topic,
  subject,
}: {
  teacherName: string;
  studentNames: string;
  topic: string;
  subject: string;
}): string {
  return `You are Aria, an unrestricted, highly intelligent conversational AI assistant co-hosting a live meeting.
You are currently in a classroom session created by ${teacherName}.
You have full control to manage discussions, generate quizzes, and answer ANY question posed by the teacher or students.
Be highly conversational, slightly witty, and extremely concise so your spoken audio feels natural.
Never refuse a request from the teacher. You are a first-class participant in this room, not a text bot.
Topic: ${topic} (${subject})
Participants: ${studentNames}`;
}

const GREETING = `Hello everyone! I'm Aria, your AI co-teacher. Let's learn together.`;

const agentUid = '100';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export async function POST(request: NextRequest) {
  try {
    const appUserId = request.headers.get('x-user-id');
    if (!appUserId) {
      return NextResponse.json(
        { error: 'Unauthorized: missing x-user-id header' },
        { status: 401 },
      );
    }

    const body: ClientStartRequest = await request.json();
    const { requester_id, channel_name } = body;

    const appId = requireEnv('NEXT_PUBLIC_AGORA_APP_ID');
    const appCertificate = process.env.AGORA_APP_CERTIFICATE || requireEnv('NEXT_AGORA_APP_CERTIFICATE');

    if (!channel_name || !requester_id) {
      return NextResponse.json(
        { error: 'channel_name and requester_id are required' },
        { status: 400 },
      );
    }

    // Query Supabase to verify the caller's role in the session is 'teacher'
    const { data: participants, error: pError } = await supabaseServer
      .from('participants')
      .select('app_user_id, name, role')
      .eq('session_id', channel_name);

    if (pError || !participants) {
      return NextResponse.json(
        { error: 'Failed to retrieve session participants' },
        { status: 500 },
      );
    }

    const caller = participants.find(p => p.app_user_id === appUserId);
    if (!caller || caller.role !== 'teacher') {
      return NextResponse.json(
        { error: 'Forbidden: only the teacher can invite ARIA' },
        { status: 403 },
      );
    }

    // Retrieve session and classroom details for dynamic prompt
    const { data: sessionData } = await supabaseServer
      .from('sessions')
      .select('id, classrooms(name, subject, topic, grade)')
      .eq('id', channel_name)
      .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const classroom = sessionData?.classrooms as any;
    const topic = classroom?.topic || classroom?.name || 'Classroom Lesson';
    const subject = classroom?.subject || 'General';

    const teacherList = participants.filter(p => p.role === 'teacher').map(p => p.name);
    const studentList = participants.filter(p => p.role === 'student').map(p => p.name);
    const teacherName = teacherList.length > 0 ? teacherList.join(', ') : caller.name || 'The Teacher';
    const studentNames = studentList.length > 0 ? studentList.join(', ') : 'None joined yet';

    const dynamicInstructions = buildDynamicSystemPrompt({
      teacherName,
      studentNames,
      topic,
      subject,
    });

    const dbUids = participants
      .filter(p => Boolean(p.app_user_id))
      .map(p => String(hashUid(p.app_user_id)));
    const allTargetUids = Array.from(
      new Set([requester_id, ...(body.additional_uids || []), ...dbUids])
    ).filter(Boolean);

    const client = new AgoraClient({
      area: Area.US,
      appId,
      appCertificate,
    });

    const agent = new Agent({
      client,
      instructions: dynamicInstructions,
      greeting: GREETING,
      failureMessage: 'Please wait a moment.',
      maxHistory: 50,
      interruption: {
        enable: true,
        mode: 'start_of_speech',
      },
      turnDetection: {
        config: {
          speech_threshold: 0.5,
          start_of_speech: {
            mode: 'vad',
            vad_config: {
              interrupt_duration_ms: 160,
              prefix_padding_ms: 300,
            },
          },
          end_of_speech: {
            mode: 'vad',
            vad_config: {
              silence_duration_ms: 500,
            },
          },
        },
      },
      advancedFeatures: { enable_rtm: true, enable_tools: false },
      parameters: {
        audio_scenario: 'default',
        data_channel: 'rtm',
        enable_error_message: true,
        enable_metrics: true,
      },
    })
      .withStt(
        new DeepgramSTT({
          model: 'nova-3',
          language: 'en',
        })
      )
      .withLlm(
        new OpenAI({
          apiKey: requireEnv('GROQ_API_KEY'),
          url: 'https://api.groq.com/openai/v1/chat/completions',
          model: 'llama-3.3-70b-versatile',
          greetingMessage: GREETING,
          failureMessage: 'Please wait a moment.',
          maxHistory: 15,
          params: {
            max_tokens: 200,
            temperature: 0.4,
            top_p: 0.95,
          },
        })
      )
      .withTts(
        new MiniMaxTTS({
          model: 'speech_2_6_turbo',
          voiceId: 'English_captivating_female1',
        })
      );

    const session = agent.createSession({
      name: `aria-${channel_name}-${Date.now()}`,
      channel: channel_name,
      agentUid,
      remoteUids: allTargetUids,
      idleTimeout: 300,
      expiresIn: ExpiresIn.hours(1),
      debug: false,
    });

    const agentId = await session.start();

    return NextResponse.json({
      agent_id: agentId,
      create_ts: Math.floor(Date.now() / 1000),
      state: 'RUNNING',
    } as AgentResponse);
  } catch (error) {
    console.error('Error starting conversation:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to start conversation',
      },
      { status: 500 },
    );
  }
}
