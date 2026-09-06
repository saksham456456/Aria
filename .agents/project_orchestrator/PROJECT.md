# Project: Aria-CoTeacher Regressions & Multi-Agent Stabilization

## Architecture
- **WebRTC & Realtime Media**: Agora RTC Web SDK (`agora-rtc-sdk-ng`) for multi-party video/audio grid, track management, volume indicator, and mute states.
- **Agora Conversational AI Engine**: `agora-agents` (Node.js SDK) joined as an RTC agent (UID 100) running Whisper STT, OpenAI LLM, and MiniMax TTS.
- **Session & Participant Store**: Supabase Database (`sessions`, `participants`, `classrooms`, `transcripts`) and Supabase Realtime channels for presence, quizzes, and live broadcast events.
- **Next.js App Router**: Route handlers (`/api/session/...`, `/api/invite-agent`, `/api/quiz/...`, `/api/summary/...`) and React components (`MeetingRoom`, `VideoTile`, `AriaTile`, `PopQuiz`).

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Participant Rejoin & Unfreeze | Upsert in `/api/session/join` must clear `left_at` and update `joined_at` so returning users don't hang on loading | M1 | Survey (explorer_survey_room) |
| 2 | Safe UID & Role Mapping | Safe `hashUid` mapping in `MeetingRoom.tsx` preventing crash when `app_user_id` is null; fallback role handling | M1 | Survey (explorer_survey_room & git) |
| 3 | Agora Mute State Sync | Add `user-mute-audio`/`user-mute-video` listeners in `useAgoraMeeting` so peers see mute updates | M1 | Survey (explorer_survey_room) |
| 4 | React StrictMode & Screen Share Fix | Reset `initRef.current` on leave/unmount; sync local video preview track on screen share start/stop | M1 | Survey (explorer_survey_room) |
| 5 | PopQuiz Teacher Loopback | Enable `broadcast: { self: true }` so teacher gets the `Teacher Monitor` view upon triggering quiz | M1 | Survey (explorer_survey_room) |
| 6 | Student Summary Access | Restore student redirection to `/summary/${sessionId}` upon session end | M1 | Survey (explorer_survey_git) |
| 7 | Explicit Numeric Audio Routing | Query participants from Supabase and client, pass explicit numeric UIDs to Agora Conversational AI | M2 | Survey (explorer_survey_git & aria) |
| 8 | Client Audio Target UIDs | Pass `additional_uids` in `useAria.ts` to supply active room UIDs to `/api/invite-agent` | M2 | Survey (explorer_survey_git & aria) |
| 9 | Wake-Word & Decision Tree | Add explicit name trigger ("Aria", "Hey Aria") and Socratic classroom rules to `buildDynamicSystemPrompt` | M3 | Survey (explorer_survey_aria & git) |
| 10 | ConvoAI Agent Tuning | Set `silence_duration_ms: 800`, `temperature: 0.2`, `max_tokens: 150`, `interruption: { enable: true }` | M3 | Survey (explorer_survey_aria) |
| 11 | AriaTile Volume State | Connect `enableAudioVolumeIndicator` to `AriaTile` so speaking animation reflects actual speech | M3 | Survey (explorer_survey_aria) |
| 12 | Zod Schema Hardening | Fix `src/types/aria.ts` schemas with `z.coerce.number()` and `.default([])` / `.default('')` | M3 | Survey (explorer_survey_aria) |
| 13 | Build Stability Verification | Verify `npm run build` exits 0 with zero TypeScript/ESLint warnings | M4 | ORIGINAL_REQUEST |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Complete Regression Fix (R1 POV, R2 Audio Routing, R3 Rules & Zod) | `src/app/api/session/join/route.ts`, `src/components/meeting/MeetingRoom.tsx`, `src/hooks/meeting/useAgoraMeeting.ts`, `src/components/classroom/PopQuiz.tsx`, `src/hooks/aria/useAria.ts`, `src/app/api/invite-agent/route.ts`, `src/components/aria/AriaTile.tsx`, `src/types/aria.ts` | Survey Complete | DONE |
| M2 | Review, Adversarial Challenge & Forensic Audit | Verification across all acceptance criteria: clean build, no runtime errors, audio routing, strict rules | M1 | DONE |

## Interface Contracts
### Client `useAria` ↔ `/api/invite-agent`
- Request Header: `x-user-id: string` (UUID of teacher)
- Request Body:
  ```json
  {
    "channel_name": "string",
    "requester_id": "string (numeric hashUid)",
    "additional_uids": ["string (numeric hashUids)"]
  }
  ```
- Response 200:
  ```json
  {
    "success": true,
    "agent_id": "string",
    "agent_uid": "100"
  }
  ```
- Error Responses: 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden - student), 500 (Internal Error).

### Supabase Participants ↔ `MeetingRoom`
- `hashUid(part.app_user_id)` generates the Agora RTC numeric UID.
- Lookup: `part?.app_user_id && hashUid(part.app_user_id) === Number(user.uid)`.
- If participant not found or still joining: display `name = 'Student'` (or fallback string) and `role = 'student'` safely without throwing.

## Code Layout
- `src/app/api/session/join/route.ts`: Session joining & role preservation (owned by M1)
- `src/components/meeting/MeetingRoom.tsx`: Video grid, user POV, controls, end session routing (owned by M1)
- `src/hooks/meeting/useAgoraMeeting.ts`: Agora RTC client lifecycle, track mute listeners, volume indicator (owned by M1)
- `src/components/classroom/PopQuiz.tsx`: Quiz modal & teacher monitor view (owned by M1)
- `src/hooks/aria/useAria.ts`: ARIA agent client hook, invite parameters (owned by M2)
- `src/app/api/invite-agent/route.ts`: Agora ConvoAI session initialization, audio routing, dynamic prompt & rules (owned by M2 & M3)
- `src/components/aria/AriaTile.tsx`: ARIA avatar, speaking/listening wave animation (owned by M3)
- `src/types/aria.ts`: Zod schemas & types for ARIA interactions (owned by M3)
