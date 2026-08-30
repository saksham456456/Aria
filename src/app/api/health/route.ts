export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';


export async function GET() {
  // Validate that required env variables are present.
  // The env.ts parser already throws on boot if missing, but we can do a soft check here.

  const checkService = (val: string | undefined) => val && val.length > 0 ? "configured" : "unconfigured";

  const services = {
    supabase: checkService(process.env.SUPABASE_SERVICE_ROLE_KEY),
    agora: checkService(process.env.AGORA_APP_CERTIFICATE),
    groq: checkService(process.env.GROQ_API_KEY),
    elevenlabs: checkService(process.env.ELEVENLABS_API_KEY)
  };

  return NextResponse.json({
    success: true,
    services,
    timestamp: new Date().toISOString()
  });
}
