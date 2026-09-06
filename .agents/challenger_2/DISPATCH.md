## 2026-09-06T05:31:01Z

You are Challenger 2 for Milestone 1 in the Aria-CoTeacher project.
Project Root: C:\Users\xyzai\Desktop\Aria-CoTeacher
Authoritative User Request: C:\Users\xyzai\Desktop\Aria-CoTeacher\.agents\ORIGINAL_REQUEST.md
Project Scope: C:\Users\xyzai\Desktop\Aria-CoTeacher\.agents\project_orchestrator\PROJECT.md
Worker Handoff Report: C:\Users\xyzai\Desktop\Aria-CoTeacher\.agents\worker_m1\handoff.md

You MUST read ORIGINAL_REQUEST.md, PROJECT.md, and worker_m1/handoff.md.

Your Objective:
1. Adversarially stress-test ARIA audio routing and classroom rules (R2 and R3):
   - Test audio routing: verify `allTargetUids` creates a clean array of numeric string UIDs with no non-numeric entries, nulls, or duplicates.
   - Test ARIA rules: verify prompt enforces wake-word trigger ("Aria", "Hey Aria"), Socratic hinting (max 1-2 sentences), refusal of quiz answers/rule overrides, and hyphen mute (`-`) during lectures.
   - Test ConvoAI agent configuration: verify VAD silence duration (800ms), low temperature (0.2), low token cap (150), interruption support enabled.
   - Test Zod validation: verify `z.coerce.number()` on number fields, defaults on array/string fields in `src/types/aria.ts`.
2. Run build verification (`npm run build`).
3. Render an explicit verdict in your handoff report: `APPROVE` or `REJECT`.
4. Send a message to orchestrator with your verdict, summary, and path to your handoff.md.
