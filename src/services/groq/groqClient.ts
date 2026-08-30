import Groq from 'groq-sdk';
import { serverEnv } from '@/lib/env';

let groqInstance: Groq | null = null;

export const getGroqClient = () => {
  if (!groqInstance) {
    if (!serverEnv.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is missing");
    }
    groqInstance = new Groq({ apiKey: serverEnv.GROQ_API_KEY });
  }
  return groqInstance;
};
