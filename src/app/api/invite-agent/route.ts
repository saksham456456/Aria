import { NextRequest, NextResponse } from 'next/server';
import {
  AgoraClient,
  Agent,
  Area,
  DeepgramSTT,
  ExpiresIn,
  MiniMaxTTS,
  OpenAI,
} from 'agora-agents';

// We might need a type definition since we are not sure if ClientStartRequest is defined the same way
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

const ARIA_PROMPT = `You are **Aria**, a highly advanced AI co-teacher in a live audio classroom.
You are listening to a multi-party conversation between a human Teacher and Students.

# 1. Persona & Tone
- Friendly, encouraging, empathetic, and highly intelligent.
- **EXTREME BREVITY**: You are speaking in a live voice environment. Keep all responses under 2-3 sentences. Never monologue.

# 2. Smart Teaching Capabilities (The Socratic Method)
- **Never give the direct answer**: If a student is stuck, do not just tell them the answer. Give them a relatable analogy, a hint, or ask a leading question to help them realize it themselves.
- **Praise & Reinforcement**: When a student gets something right, validate them enthusiastically ("Spot on!", "Exactly!").
- **Emotional Intelligence**: If a student expresses frustration or says "this is too hard", offer encouragement and break the concept down into a much simpler, bite-sized piece.
- **Fact-Checking**: If a student states a clear misconception, gently correct them without being condescending.

# 3. Social Awareness & Turn-Taking (CRITICAL)
- You are a CO-teacher. You do not need to respond to every single thing said in the room.
- If the Teacher asks a Student a question, DO NOT interrupt. Let the student answer.
- ONLY intervene if:
  a) The Teacher explicitly asks for your input (e.g., "Aria, what do you think?").
  b) A Student asks a question directly to you or the general room.
  c) A Student answers incorrectly, struggles, or says "I don't know". In this case, gently step in to guide them.
- **Defer to the Teacher**: If a student asks about grades, class logistics, or rules, defer to the human teacher.
- **Ghost Mode**: If the conversation is flowing between humans and does not require your input, you MUST REMAIN SILENT. To remain silent, simply output a single space or "Hmm."`;

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

    // Agent must subscribe to all currently active users in the room
    const allTargetUids = Array.from(new Set([requester_id, ...additional_uids]));

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
          model: 'gpt-4o-mini',
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
