# Original User Request

## Initial Request — 2026-09-06T05:05:36Z

# Teamwork Project Prompt — Draft

> Status: Ready for launch — awaiting user approval
> Goal: Craft prompt -> get user approval -> delegate to teamwork_preview
> Requested team: [none — teamwork routes from the description]

Diagnose and fix all regressions introduced by the recent multi-agent refactor in the Aria-CoTeacher project. The meeting room, video grid, and ARIA agent must function flawlessly without any errors, even if it requires reverting the recent wildcard audio routing or UI changes back to the last known working state.

Working directory: C:\Users\xyzai\Desktop\Aria-CoTeacher
Integrity mode: development

## Requirements

### R1. Fix Meeting Room & POV Logic
The team must thoroughly debug and fix all errors in the meeting room. Specifically, the teacher and student POVs must be distinct and functional. If the recent UID mapping or role segregation caused the video grid or controls to break, fix the implementation so it works flawlessly with the Agora SDK.

### R2. Fix ARIA's Listening and Responding
Ensure ARIA correctly subscribes to and hears both the teacher and the students. If the `['*']` wildcard audio routing caused an SDK crash or failure to join, the team must implement a working alternative (or fix the wildcard usage) so that ARIA successfully listens and responds to all users in the room.

### R3. Set Working Rules for ARIA
Establish and enforce strict, working behavioral rules for the AI agent in her prompt and backend logic so her responses are predictable and appropriately handled for the classroom context.

## Acceptance Criteria

### Verification Checks
- [ ] **No Console/Runtime Errors**: The meeting room loads and operates without throwing unhandled exceptions or SDK errors for both teachers and students.
- [ ] **Audio Routing Verified**: The ARIA agent successfully joins the room, subscribes to the audio of both the teacher and the student, and can respond.
- [ ] **Build Stability**: `npm run build` exits with code 0 (no TypeScript or ESLint errors).
