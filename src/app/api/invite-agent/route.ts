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

const ARIA_PROMPT = `You are ARIA, an advanced AI Co-Teacher in a live audio classroom.
You are listening to a live voice conversation between a teacher and their students.

Your role:
- Be highly concise (1-2 sentences maximum).
- Use the Socratic method: If someone is stuck, give a hint or ask a leading question. Do not just give the final answer.
- Be encouraging, friendly, and supportive.
- Do not use any markdown, emojis, or formatting. Speak naturally.
- Always respond intelligently to whoever is speaking to you.`;

const GREETING = `Hello everyone! I'm Aria, your AI co-teacher. Let's learn together.`;

const agentUid = '100';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export async function POST(request: NextRequest) {
  try {
    const body: ClientStartRequest = await request.json();
    const { requester_id, channel_name, additional_uids = [] } = body;

    const appId = requireEnv('NEXT_PUBLIC_AGORA_APP_ID');
    const appCertificate = process.env.AGORA_APP_CERTIFICATE || requireEnv('NEXT_AGORA_APP_CERTIFICATE');

    if (!channel_name || !requester_id) {
      return NextResponse.json(
        { error: 'channel_name and requester_id are required' },
        { status: 400 },
      );
    }

    const { data: participants } = await supabaseServer
      .from('participants')
      .select('app_user_id')
      .eq('session_id', channel_name);

    const dbUids = (participants || []).map(p => String(hashUid(p.app_user_id)));
    const allTargetUids = Array.from(new Set([requester_id, ...additional_uids, ...dbUids]));

    const client = new AgoraClient({
      area: Area.US,
      appId,
      appCertificate,
    });

    const agent = new Agent({
      client,
      instructions: ARIA_PROMPT,
      greeting: GREETING,
      failureMessage: 'Please wait a moment.',
      maxHistory: 50,
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
              silence_duration_ms: 480,
            },
          },
        },
      },
      advancedFeatures: { enable_rtm: true, enable_tools: false },
      parameters: {
        audio_scenario: 'chorus',
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
          apiKey: process.env.GROQ_API_KEY,
          url: 'https://api.groq.com/openai/v1',
          model: 'llama-3.3-70b-versatile',
          greetingMessage: GREETING,
          failureMessage: 'Please wait a moment.',
          maxHistory: 15,
          params: {
            max_tokens: 1024,
            temperature: 0.7,
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
