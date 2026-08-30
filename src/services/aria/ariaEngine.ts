import { ClassroomContext, AriaResponseSchema, AriaResponse } from '@/types/aria';
import { getGroqClient } from '@/services/groq/groqClient';

export async function evaluateContext(context: ClassroomContext): Promise<AriaResponse> {
  const groq = getGroqClient();

  const systemMessage = `You are ARIA, an AI Voice Co-Teacher for a live digital classroom.
Your goal is to evaluate the classroom context and decide if you should speak.
You must output ONLY valid JSON matching the provided schema.

Evaluation policy:
- Teacher actively explaining -> prefer silence (shouldSpeak: false)
- Student asks direct question -> consider response
- Multiple students show confusion -> increase priority
- Teacher explicitly commands ARIA -> respond immediately (bypass cooldown)
- ARIA mode is SILENT -> analyze and store, but do not speak (shouldSpeak: false)
- ARIA mode is MANUAL -> only respond to teacher commands

Explanation levels based on student learning level:
- beginner: Simple language, concrete real-world examples, short sentences
- intermediate: Normal classroom explanation, standard mathematical vocabulary
- advanced: Formal reasoning, alternative methods, connections to related concepts

If a student asks in Hindi, you may respond in 'hi' or 'en+hi'. Default to 'en'.

Classroom Context:
${JSON.stringify(context, null, 2)}
`;

  const userMessage = "Evaluate the current context and provide your response in JSON format matching the schema.";

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemMessage },
      { role: 'user', content: userMessage }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.4,
    max_tokens: 1024,
  });

  const rawJson = completion.choices[0]?.message?.content || '{}';

  try {
    const parsed = JSON.parse(rawJson);
    return AriaResponseSchema.parse(parsed);
  } catch (err) {
    console.error("Failed to parse ARIA response", err, rawJson);
    throw new Error("Invalid ARIA response format");
  }
}
