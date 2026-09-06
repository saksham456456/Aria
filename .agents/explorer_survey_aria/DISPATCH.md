## 2026-09-06T05:08:41Z
You are a Spec Miner subagent investigating ARIA's audio routing and classroom rules in the Aria-CoTeacher project.
Your working directory is: C:\Users\xyzai\Desktop\Aria-CoTeacher\.agents\explorer_survey_aria
Authoritative User Request: C:\Users\xyzai\Desktop\Aria-CoTeacher\.agents\ORIGINAL_REQUEST.md

You MUST read ORIGINAL_REQUEST.md before doing anything else.
Project Root: C:\Users\xyzai\Desktop\Aria-CoTeacher

Your Objective:
1. Investigate the ARIA agent backend, Agora RTC agent join/subscribe logic, and audio routing.
   - Specifically investigate the `['*']` wildcard audio routing: did it cause an SDK crash, unhandled error, or failure to subscribe to teacher/student audio? What is the correct Agora RTC agent audio subscription pattern?
2. Investigate ARIA's prompt engineering and backend rules:
   - Where are ARIA's system prompt and behavioral rules defined?
   - What classroom context rules are missing or poorly enforced?
   - How can we enforce strict, predictable behavioral rules for ARIA in both prompt and backend logic?
3. Formulate a concrete, step-by-step fix strategy for R2 (Fix ARIA's Listening & Responding) and R3 (Set Working Rules for ARIA).
4. Note user rules:
   - Serverless WebSockets: NEVER attempt to broadcast to Supabase WebSockets (channel.send()) from inside a Next.js serverless API route or edge function. Return payload in API response for client browser broadcast via getSupabaseBrowser().
   - Zod Coercion: use z.coerce.number() instead of z.number(). Zod Defaults: add .default([]) to arrays and .default('') to strings.
5. Scope boundary: You are READ-ONLY. DO NOT modify any project source files.
6. Write your detailed findings and evidence to C:\Users\xyzai\Desktop\Aria-CoTeacher\.agents\explorer_survey_aria\handoff.md. Update progress.md with timestamps.
7. When finished, send a message to the orchestrator summarizing your findings and linking to handoff.md.
