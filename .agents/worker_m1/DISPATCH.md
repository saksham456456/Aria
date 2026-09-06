## 2026-09-06T05:20:09Z

You are the Worker subagent responsible for Milestone 1: Complete Multi-Agent Regression Fixes in the Aria-CoTeacher project.
Your working directory is: C:\Users\xyzai\Desktop\Aria-CoTeacher\.agents\worker_m1
Authoritative User Request: C:\Users\xyzai\Desktop\Aria-CoTeacher\.agents\ORIGINAL_REQUEST.md
Project Scope & Contracts: C:\Users\xyzai\Desktop\Aria-CoTeacher\.agents\project_orchestrator\PROJECT.md

Before starting, read:
1. ORIGINAL_REQUEST.md
2. PROJECT.md
3. Survey reports from earlier explorer subagents:
   - C:\Users\xyzai\.gemini\antigravity\brain\b48a2773-14aa-4735-a6ad-f3f253930db5\handoff.md
   - C:\Users\xyzai\.gemini\antigravity\brain\b43eee9c-78cd-414c-b3fe-cf27d0f81776\handoff.md
   - C:\Users\xyzai\.gemini\antigravity\brain\9bbb793d-8cb1-491f-a729-ceb02feedf95\handoff.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

USER RULES:
- Serverless WebSockets: NEVER attempt to broadcast to Supabase WebSockets (channel.send()) from inside a Next.js serverless API route or edge function. Return payload in API response for client browser broadcast via getSupabaseBrowser().
- Zod Coercion: When defining Zod schemas to parse JSON responses from LLMs, you MUST use z.coerce.number() instead of z.number().
- Zod Defaults: Always add .default([]) to array fields and .default('') to string fields.

You exclusively own and can modify these files:
- src/app/api/session/join/route.ts
- src/components/meeting/MeetingRoom.tsx
- src/hooks/meeting/useAgoraMeeting.ts
- src/components/classroom/PopQuiz.tsx
- src/hooks/aria/useAria.ts
- src/app/api/invite-agent/route.ts
- src/components/aria/AriaTile.tsx
- src/types/aria.ts

Tasks to Implement:
1. `src/app/api/session/join/route.ts`:
   - In the participant upsert payload, explicitly include `left_at: null` and `joined_at: new Date().toISOString()`. This fixes returning participants who left from being filtered out by `useParticipants` (.is('left_at', null)) and stuck on "Loading Classroom...".
2. `src/components/meeting/MeetingRoom.tsx`:
   - Safe UID mapping: replace `hashUid(part.app_user_id) === Number(user.uid)` with `Boolean(part.app_user_id) && hashUid(part.app_user_id) === Number(user.uid)` to prevent TypeError if app_user_id is missing.
   - Timeout in `MeetingRoomParticipantLoader`: add fallback timeout (5s) so an unauthenticated or invalid session redirects gracefully rather than freezing.
   - Restore student summary access: on session end, redirect both teacher and students to `/summary/${sessionId}` (as designed in 3c85663).
3. `src/hooks/meeting/useAgoraMeeting.ts`:
   - Listen for Agora mute/unmute events: `user-mute-audio`, `user-unmute-audio`, `user-mute-video`, `user-unmute-video` to keep remote user mic/camera states synchronized.
   - Enable volume indicators via `client.enableAudioVolumeIndicator()`.
   - React StrictMode fix: reset `initRef.current = false` on `leave()` and during `useEffect` cleanup.
   - Screen share sync: update local video track when screen sharing starts and restore camera track when stopped.
4. `src/components/classroom/PopQuiz.tsx`:
   - Set `config: { broadcast: { self: true } }` on the Supabase Realtime channel so teacher's broadcast loops back to open the Teacher Monitor view.
5. `src/hooks/aria/useAria.ts`:
   - Send `additional_uids: currentRemoteUids` (or active remote UIDs) in the POST body to `/api/invite-agent`.
6. `src/app/api/invite-agent/route.ts`:
   - Fix Audio Routing: query participants from Supabase, compute `dbUids = participants.map(p => String(hashUid(p.app_user_id)))`, and create `allTargetUids = Array.from(new Set([requester_id, ...(body.additional_uids || []), ...dbUids])).filter(Boolean)`. Pass `remoteUids: allTargetUids`.
   - Fix Prompt & Classroom Rules:
     - Restore explicit name trigger ("Aria", "Hey Aria") or teacher direct invitation: YOU MUST SPEAK.
     - Socratic hint rule: 1-2 sentences maximum, never give quiz answers directly.
     - Quiz integrity rule: politely decline cheating / rule overrides.
     - Silence rule: output "-" when humans are lecturing or talking to each other.
   - Fix Agent Settings:
     - `turnDetection.config.end_of_speech.vad_config.silence_duration_ms`: 800
     - `temperature`: 0.2
     - `max_tokens`: 150
     - `interruption`: `{ enable: true, mode: 'start_of_speech' }`
     - `parameters.audio_scenario`: `'default'`
7. `src/components/aria/AriaTile.tsx`:
   - Ensure props and types handle `AgoraUser` or remote user, and volume indicator / speaking wave animation works cleanly without getting stuck.
8. `src/types/aria.ts`:
   - Apply `z.coerce.number()` to number fields, add `.default([])` to arrays, `.default('')` to strings.
9. Verification:
   - Run `npm run build` to guarantee exit code 0.
   - Document verification results and all changes in `C:\Users\xyzai\Desktop\Aria-CoTeacher\.agents\worker_m1\handoff.md`.
10. Send a message to the orchestrator when completed with summary and link to handoff.md.

## 2026-09-06T05:57:37Z

You are a Worker subagent tasked with fixing a TypeScript type annotation in tests/unit/adversarial_m1.test.ts.
Project Root: C:\Users\xyzai\Desktop\Aria-CoTeacher
Authoritative User Request: C:\Users\xyzai\Desktop\Aria-CoTeacher\.agents\ORIGINAL_REQUEST.md
Reviewer 2 Gen 2 Handoff Report: C:\Users\xyzai\Desktop\Aria-CoTeacher\.agents\reviewer_2_gen2\handoff.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your Task:
1. In `tests/unit/adversarial_m1.test.ts` around line 92-93:
   Change:
   `const isVisibleInRoom = (p: typeof updatedParticipant) => p.left_at === null;`
   To:
   `const isVisibleInRoom = (p: { left_at: string | null | undefined }) => p.left_at === null;`
   (The current type `typeof updatedParticipant` is too narrow because `updatedParticipant.left_at` is `null`, so passing `existingParticipant` where `left_at` is `string` triggers TS2345).
2. Run `npx tsc --noEmit` and confirm exit code 0.
3. Run `npm test` and confirm all 17 tests pass (exit code 0).
4. Run `npm run build` and confirm exit code 0.
5. Send a message to orchestrator with your results and handoff.md path.
