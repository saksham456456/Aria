# Project: Aria-CoTeacher Debugging & Build Remediation

## Architecture
- **Framework**: Next.js 14.2.35 (App Router under `src/app/`)
- **Language & Runtime**: TypeScript 5, Node.js 18+
- **Styling**: Tailwind CSS 3.4.1, PostCSS 8
- **RTC & Media**: Agora RTC Web SDK (`agora-rtc-sdk-ng` 4.24.7), Agora Conversational AI (`agora-agents` 2.7.0), `agora-token` 2.0.5
- **Backend & State**: Supabase (`@supabase/supabase-js` 2.112.4), Next.js API route handlers
- **AI Services**: Groq LLaMA 3.3 (`groq-sdk` 1.6.0), Web Speech API
- **Testing & Quality**: Jest 30.5.0 + ts-jest 29.4.12, ESLint 8 (`next/core-web-vitals`, `next/typescript`)

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Agora Realtime Classroom RTC | Multi-user video/audio conferencing, track management, screen sharing | M2 | Survey |
| 2 | ARIA Conversational AI Co-Teacher | Voice AI agent streaming, state management, pause/resume, commands | M1 | Survey |
| 3 | Classroom UI & Meeting Controls | Grid layout, participant tiles, controls, leave/end actions | M1 | Survey |
| 4 | Web Speech Transcription & Groq Notes | Realtime speech-to-text transcription and AI notes generation | M2 | Survey |
| 5 | Supabase Realtime State & Auth | Session state sync, persistence, token generation | M2 | Survey |
| 6 | Zero-Error ESLint & Webpack Build | Clean Next.js production build (`npm run build`, `npm run lint`) with exit code 0 | M1, M2 | ORIGINAL_REQUEST |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | ESLint & Component Remediation | Fix unescaped entities in `AriaPanel.tsx`, remove unused destructured identifiers in `MeetingRoom.tsx`, add `"test": "jest"` script to `package.json` | none | PLANNED |
| 2 | Full Build & Quality Verification | Verify `npm run lint`, `npx tsc --noEmit`, `npm test`, and `npm run build` exit cleanly with code 0 and no errors or warnings | M1 | PLANNED |

## Interface Contracts
### `useAria` Hook ↔ `MeetingRoom.tsx`
- `useAria({ sessionId, appUserId, role, agoraClient, isTeacherSpeaking })`
- Required consuming fields in `MeetingRoom`:
  - `ariaMode`: `'voice' | 'agent' | 'disabled'` passed to `<MeetingControls ariaMode={ariaMode} />`
  - `pauseAria`: `() => Promise<void>` called during `handleLeave` and `handleEndClass`
  - `voiceError`: `string | null` rendered in error notification toast

### `AriaPanel.tsx` JSX Entity Safety
- Replace raw single quote `'` in `Agora's` with `&apos;` (`react/no-unescaped-entities` compliance).

## Code Layout
- `src/app/` — Next.js App Router routes, layouts, and API endpoints (`/api/agora/token`, `/api/groq/chat`, `/api/notes/generate`)
- `src/components/aria/` — ARIA Co-Teacher UI components (`AriaPanel.tsx`, `AriaVoiceControls.tsx`, `AriaStatusBadge.tsx`)
- `src/components/meeting/` — Meeting UI components (`MeetingRoom.tsx`, `MeetingControls.tsx`, `ParticipantGrid.tsx`)
- `src/hooks/` — React custom hooks (`useAria.ts`, `useAgora.ts`, `useSpeechRecognition.ts`)
- `src/services/` — Agora RTC/Agents, Groq AI, and Supabase service clients
- `src/types/` — TypeScript domain type definitions
- `tests/` — Jest unit and integration test suites
