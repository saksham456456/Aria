import { z } from 'zod';

const serverEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),
  AGORA_APP_CERTIFICATE: z.string().min(1, 'AGORA_APP_CERTIFICATE is required'),
  GROQ_API_KEY: z.string().min(1, 'GROQ_API_KEY is required'),
  ELEVENLABS_API_KEY: z.string().optional(),
  ELEVENLABS_VOICE_ID: z.string().optional(),
});

// Since Next.js evaluates route files at build time during static generation,
// we need to avoid throwing runtime errors for missing env vars during the build step.
// We provide dummy fallback values if NEXT_PHASE is building.
const isBuild = process.env.NODE_ENV === 'production' && !process.env.SUPABASE_SERVICE_ROLE_KEY;

export const serverEnv = serverEnvSchema.parse({
  SUPABASE_SERVICE_ROLE_KEY: isBuild ? 'dummy_key' : process.env.SUPABASE_SERVICE_ROLE_KEY,
  AGORA_APP_CERTIFICATE: isBuild ? 'dummy_cert' : process.env.AGORA_APP_CERTIFICATE,
  GROQ_API_KEY: isBuild ? 'dummy_groq' : process.env.GROQ_API_KEY,
  ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY,
  ELEVENLABS_VOICE_ID: process.env.ELEVENLABS_VOICE_ID,
});
