import Groq from 'groq-sdk';
import { getServerEnv } from '@/lib/env';

let groqInstance: Groq | null = null;

/** Returns the shared Groq client. Created lazily on first request. */
export const getGroqClient = (): Groq => {
  if (!groqInstance) {
    groqInstance = new Groq({ apiKey: getServerEnv().GROQ_API_KEY });
  }
  return groqInstance;
};
