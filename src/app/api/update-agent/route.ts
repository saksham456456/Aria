import { NextRequest, NextResponse } from 'next/server';
import { AgoraClient, Area } from 'agora-agents';

interface UpdateAgentRequest {
  agent_id: string;
  remote_uids: string[];
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export async function POST(request: NextRequest) {
  try {
    const body: UpdateAgentRequest = await request.json();
    const { agent_id, remote_uids } = body;

    const appId = requireEnv('NEXT_PUBLIC_AGORA_APP_ID');
    const appCertificate = process.env.AGORA_APP_CERTIFICATE || requireEnv('NEXT_AGORA_APP_CERTIFICATE');

    if (!agent_id || !remote_uids) {
      return NextResponse.json(
        { error: 'agent_id and remote_uids are required' },
        { status: 400 },
      );
    }

    const client = new AgoraClient({
      area: Area.US,
      appId,
      appCertificate,
    });

    await client.agents.update({
      appid: appId,
      agentId: agent_id,
      properties: {
        remote_rtc_uids: remote_uids,
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating agent:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to update agent',
      },
      { status: 500 },
    );
  }
}
