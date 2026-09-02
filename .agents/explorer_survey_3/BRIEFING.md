# BRIEFING — 2026-09-02T14:04:30Z

## Mission
Investigate ARIA co-teacher integration, AI agents, speech-to-text / LLM / prompt handlers, WebSocket/WebRTC integration, custom hooks, global/local state management, and API routes/services. Catalog all TypeScript compilation errors, ESLint violations, async/promise handling issues, missing types/interfaces, and integration bugs with exact line numbers and fix strategies.

## 🔒 My Identity
- Archetype: Explorer
- Roles: ARIA Integration & State Specialist
- Working directory: C:\Users\xyzai\Desktop\Aria-CoTeacher\.agents\explorer_survey_3
- Original parent: 64f47d31-4213-4f46-92df-eb82bb0e7ef2
- Milestone: Survey & Investigation (Phase 1)

## 🔒 Key Constraints
- Read-only investigation — do NOT implement changes in source code
- Working directory metadata only in C:\Users\xyzai\Desktop\Aria-CoTeacher\.agents\explorer_survey_3
- Deliver complete 5-component handoff report to handoff.md and send_message to parent orchestrator

## Current Parent
- Conversation ID: 64f47d31-4213-4f46-92df-eb82bb0e7ef2
- Updated: 2026-09-02T14:04:30Z

## Investigation State
- **Explored paths**:
  - `src/services/` (`agoraClient.ts`, `tokenService.ts`, `groqClient.ts`, `supabase/client.ts`, `supabase/server.ts`)
  - `src/hooks/` (`aria/useAria.ts`, `classroom/useChat.ts`, `classroom/useParticipants.ts`, `classroom/useSession.ts`, `meeting/useAgoraMeeting.ts`, `speech/useSpeechRecognition.ts`, `useSpeech.ts`)
  - `src/types/` (`agora.ts`, `aria.ts`, `meeting.ts`, `session.ts`, `speech.d.ts`)
  - `src/lib/` (`api.ts`, `env.ts`, `errors.ts`, `uid.ts`, `utils.ts`)
  - `src/app/api/` (`agora/token`, `health`, `invite-agent`, `session/create`, `session/end`, `session/join`, `session/summary`, `summary`)
  - `src/components/` (`aria/AriaPanel.tsx`, `aria/AriaTile.tsx`, `meeting/MeetingRoom.tsx`, `meeting/MeetingControls.tsx`, `meeting/MeetingHeader.tsx`, `meeting/VideoGrid.tsx`, `meeting/VideoTile.tsx`, `meeting/ConnectionBanner.tsx`, `meeting/EndMeetingDialog.tsx`, `chat/ChatPanel.tsx`, `participants/ParticipantsPanel.tsx`, `classroom/CreateClassroomForm.tsx`, `classroom/JoinClassroomForm.tsx`, `summary/SummaryView.tsx`)
  - `tests/unit/` (`aria.test.ts`, `basic.test.ts`, `speechRecognition.test.ts`)
  - `supabase/migrations/` (`20250101000000_initial_schema.sql`)
- **Key findings**:
  - `next build` and `next lint` fail with ESLint violations:
    1. `src/components/aria/AriaPanel.tsx:32`: unescaped single quote in `Agora's` (`react/no-unescaped-entities`).
    2. `src/components/meeting/MeetingRoom.tsx:98-99`: unused variables (`setAriaMode`, `ariaState`, `ariaPaused`, `resumeAria`, `sendCommand`) from `useAria` destructuring (`@typescript-eslint/no-unused-vars`).
  - Unit tests via `npx jest` run cleanly (3/3 test suites passed).
  - WebRTC (Agora RTC SDK `4.24.7` + Agora Conversational AI `agora-agents 2.7.0`) and WebSocket (Supabase Realtime channels) integration paths are functional with specific lifecycle & subscription patterns documented.
- **Unexplored areas**: All in-scope areas thoroughly surveyed and cataloged.

## Key Decisions Made
- Cataloged all bugs, warnings, typing inconsistencies, and async lifecycles into a structured survey report.

## Artifact Index
- C:\Users\xyzai\Desktop\Aria-CoTeacher\.agents\explorer_survey_3\progress.md — Liveness & task tracker
- C:\Users\xyzai\Desktop\Aria-CoTeacher\.agents\explorer_survey_3\handoff.md — Final survey report
