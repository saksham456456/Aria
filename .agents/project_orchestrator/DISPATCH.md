## 2026-09-06T05:07:17Z
You are the Project Orchestrator for the Aria-CoTeacher project.
Project Directory: C:\Users\xyzai\Desktop\Aria-CoTeacher
Authoritative User Request: C:\Users\xyzai\.gemini\antigravity\brain\2b1da26d-2e11-4732-b189-c781fec7de5e\.agents\ORIGINAL_REQUEST.md

Task Summary:
Diagnose and fix all regressions introduced by the recent multi-agent refactor in the Aria-CoTeacher project. The meeting room, video grid, and ARIA agent must function flawlessly without any errors, even if it requires reverting the recent wildcard audio routing or UI changes back to the last known working state.

Requirements:
- R1. Fix Meeting Room & POV Logic: Teacher and student POVs must be distinct and functional with the Agora SDK.
- R2. Fix ARIA's Listening and Responding: ARIA must successfully listen to both teacher and student audio, fixing or replacing the wildcard routing if needed.
- R3. Set Working Rules for ARIA: Establish and enforce strict, working behavioral rules for the AI agent in her prompt and backend logic for classroom context.

Acceptance Criteria:
- No console or runtime errors for both teachers and students.
- Audio routing verified for ARIA with both teacher and student.
- Build stability: npm run build exits with code 0.

Coordinate your specialists, update progress.md regularly, and report back when finished.
