import { z } from 'zod';

const serverEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),
  AGORA_APP_CERTIFICATE:     z.string().min(1, 'AGORA_APP_CERTIFICATE is required'),
  GROQ_API_KEY:              z.string().min(1, 'GROQ_API_KEY is required'),
  // ElevenLabs is optional — app falls back to browser SpeechSynthesis when absent.
  ELEVENLABS_API_KEY:  z.string().optional(),
  ELEVENLABS_VOICE_ID: z.string().optional(),
});

type ServerEnv = z.infer<typeof serverEnvSchema>;

// Parsed lazily so Next.js static analysis doesn't crash at build time
// when env vars aren't present (e.g. in CI before secrets are injected).
let _parsed: ServerEnv | null = null;

export function getServerEnv(): ServerEnv {
  if (!_parsed) {
    _parsed = serverEnvSchema.parse({
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      AGORA_APP_CERTIFICATE:     process.env.AGORA_APP_CERTIFICATE,
      GROQ_API_KEY:              process.env.GROQ_API_KEY,
      ELEVENLABS_API_KEY:        process.env.ELEVENLABS_API_KEY,
      ELEVENLABS_VOICE_ID:       process.env.ELEVENLABS_VOICE_ID,
    });
  }
  return _parsed;
}

/** Convenience export for modules that need it at import time (still lazy via getter). */
export const serverEnv = new Proxy({} as ServerEnv, {
  get(_target, prop: string) {
    return getServerEnv()[prop as keyof ServerEnv];
  },
});

export const elevenLabsConfigured = (): boolean =>
  Boolean(getServerEnv().ELEVENLABS_API_KEY && getServerEnv().ELEVENLABS_VOICE_ID);
