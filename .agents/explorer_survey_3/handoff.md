# Survey & Investigation Report: ARIA Integration & State Management

**Agent**: Explorer 3 (ARIA Integration & State Specialist)  
**Date**: 2026-09-02  
**Scope**: ARIA co-teacher integration, AI agents, speech-to-text / LLM / prompt handlers, WebSocket/WebRTC integration, custom hooks, global/local state management, API routes & services.

---

## 1. Observation

### 1.1 Command Execution & Diagnostics Results

1. **TypeScript Compilation Check (`npx tsc --noEmit`)**:
   - **Command**: `npx tsc --noEmit`
   - **Exit code**: `0`
   - **Result**: No direct TypeScript syntax/compilation errors in the current TypeScript configuration (`tsconfig.json`).

2. **ESLint / Next.js Lint Check (`npm run lint` / `next lint`)**:
   - **Command**: `npm run lint`
   - **Exit code**: `1` (Failed)
   - **Verbatim Error Output**:
     ```text
     ./src/components/aria/AriaPanel.tsx
     32:114  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities

     ./src/components/meeting/MeetingRoom.tsx
     98:15  Error: 'setAriaMode' is assigned a value but never used.  @typescript-eslint/no-unused-vars
     98:28  Error: 'ariaState' is assigned a value but never used.  @typescript-eslint/no-unused-vars
     98:39  Error: 'ariaPaused' is assigned a value but never used.  @typescript-eslint/no-unused-vars
     99:16  Error: 'resumeAria' is assigned a value but never used.  @typescript-eslint/no-unused-vars
     99:28  Error: 'sendCommand' is assigned a value but never used.  @typescript-eslint/no-unused-vars
     ```

3. **Next.js Production Build (`npm run build` / `next build`)**:
   - **Command**: `npm run build`
   - **Exit code**: `1` (Failed at "Linting and checking validity of types")
   - **Verbatim Output**:
     ```text
       ▲ Next.js 14.2.35
        Creating an optimized production build ...
      ✓ Compiled successfully
        Linting and checking validity of types ...

     Failed to compile.
     ./src/components/aria/AriaPanel.tsx:32:114 Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
     ./src/components/meeting/MeetingRoom.tsx:98:15 Error: 'setAriaMode' is assigned a value but never used.  @typescript-eslint/no-unused-vars
     ./src/components/meeting/MeetingRoom.tsx:98:28 Error: 'ariaState' is assigned a value but never used.  @typescript-eslint/no-unused-vars
     ./src/components/meeting/MeetingRoom.tsx:98:39 Error: 'ariaPaused' is assigned a value but never used.  @typescript-eslint/no-unused-vars
     ./src/components/meeting/MeetingRoom.tsx:99:16 Error: 'resumeAria' is assigned a value but never used.  @typescript-eslint/no-unused-vars
     ./src/components/meeting/MeetingRoom.tsx:99:28 Error: 'sendCommand' is assigned a value but never used.  @typescript-eslint/no-unused-vars
     ```

4. **Unit Tests (`npx jest`)**:
   - **Command**: `npx jest`
   - **Exit code**: `0`
   - **Result**: `Test Suites: 3 passed, 3 total; Tests: 3 passed, 3 total`.

---

### 1.2 Comprehensive Codebase Inventory by Domain

#### A. ARIA AI Co-Teacher & AI Agents
1. **`src/app/api/invite-agent/route.ts`**:
   - **Function**: Spawns and configures the Agora Conversational AI Agent (`agora-agents` v2.7.0) with `DeepgramSTT` (`nova-3`), `OpenAI` (`gpt-4o-mini`), and `MiniMaxTTS` (`speech_2_6_turbo`).
   - **Agent UID**: Hardcoded to `'100'`.
   - **Channel Subscription**: `remoteUids: [requester_id]` (starts listening to the teacher).
   - **Status**: Compiles cleanly; uses lazy environment variable helper `requireEnv`.

2. **`src/hooks/aria/useAria.ts`**:
   - **Function**: Client-side hook managing ARIA agent lifecycle.
   - **Trigger**: When `role === 'teacher'`, `agoraClient.uid` exists, and `!agentInvitedRef.current`, calls `POST /api/invite-agent`.
   - **Returns**: `ariaMode`, `setAriaMode`, `ariaState`, `ariaPaused`, `pauseAria`, `resumeAria`, `sendCommand`, `lastCommand`, `voiceError`.
   - **Status**: Compiles cleanly; caller `MeetingRoom.tsx` destructures unused methods.

3. **`src/components/aria/AriaPanel.tsx`**:
   - **Function**: Slide-over panel presenting the status of the Agora Conversational AI engine.
   - **Issue (Line 32)**: Direct unescaped apostrophe in `"Agora's"` violates `react/no-unescaped-entities`.

4. **`src/components/aria/AriaTile.tsx`**:
   - **Function**: Video grid tile dedicated to ARIA (Remote User UID `100`).
   - **Visuals**: Animated audio waves when `user.hasAudio` is true; "Listening" badge when connected; "Waiting..." when offline.
   - **Status**: Compiles cleanly.

5. **`src/types/aria.ts`**:
   - **Types**: `AriaResponseSchema` (Zod schema for structured LLM pedagogical responses), `AriaLLMResponse`, `ClassroomContext`, `AriaResponse`.

---

#### B. Speech-to-Text, LLM & Prompt Handlers
1. **`src/hooks/speech/useSpeechRecognition.ts`**:
   - **Function**: Manages browser-native Web Speech API (`window.SpeechRecognition || window.webkitSpeechRecognition`).
   - **Transcription Flow**: Filters `result.isFinal === true`, extracts transcript, notifies `onSpeakingChange(true)`, and inserts rows directly into Supabase table `transcript_segments`.
   - **Error Handling**: Suppresses standard non-critical speech errors (`no-speech`, `aborted`); auto-restarts on `onend` if microphone remains active.
   - **Status**: Validated and typechecked.

2. **`src/hooks/useSpeech.ts`**:
   - **Function**: Secondary/legacy speech hook.
   - **Typing**: Contains unnecessary `any` type casts (`useRef<any>`, `event: any`) and ESLint disable comments.
   - **Status**: Does not cause build failures, but can be type-strengthened using `types/speech.d.ts`.

3. **`src/services/groq/groqClient.ts`**:
   - **Function**: Singleton client factory `getGroqClient()` using `groq-sdk` with `getServerEnv().GROQ_API_KEY`.
   - **Status**: Clean lazy instantiation.

4. **`src/app/api/summary/route.ts`**:
   - **Function**: Post-session summary generation endpoint for teachers.
   - **Workflow**:
     1. Validates teacher identity and permissions.
     2. Checks for cached summary in `session_summaries`.
     3. Aggregates session, transcript, and learning gap rows from Supabase.
     4. Prompts Groq (`llama-3.3-70b-versatile`) with structured JSON schema.
     5. Validates Groq JSON response against `SummarySchema` (Zod).
     6. Upserts result into `session_summaries` table.
   - **Issue (Line 139-140)**: `(err as any).errors.map((e: any) => e.message)` uses `any` instead of typed `z.ZodError`.

5. **`src/app/api/session/summary/route.ts`**:
   - **Function**: Alternative/legacy summary endpoint with minimal Groq prompt.

---

#### C. WebRTC (Agora RTC) & WebSocket (Supabase Realtime)
1. **`src/services/agora/agoraClient.ts`**:
   - **Function**: Browser singleton manager (`getAgoraClient()`, `resetAgoraClient()`) for `IAgoraRTCClient`.
   - **Safety**: Throws on server (SSR protection).

2. **`src/services/agora/tokenService.ts`**:
   - **Function**: Client-side fetcher calling `/api/agora/token` with hashed numeric UID.

3. **`src/app/api/agora/token/route.ts`**:
   - **Function**: Server-side token generator using `agora-token` (`RtcTokenBuilder.buildTokenWithUid`) with 24-hour expiration.

4. **`src/hooks/meeting/useAgoraMeeting.ts`**:
   - **Function**: Full Agora RTC lifecycle hook.
   - **Capabilities**:
     - Media track creation (mic + camera with `360p_7` encoder config).
     - Screen sharing (`AgoraRTC.createScreenVideoTrack`).
     - Dynamic subscription to remote audio and video streams (`user-published`, `user-unpublished`, `user-left`).
     - Connection state machine mapping Agora internal states to `ConnectionState`.
     - Automatic audio playback for remote users (including ARIA AI agent).
     - Proper cleanup on unmount (`close()` on track refs, `leave()`, `resetAgoraClient()`).

5. **Supabase Realtime Channels**:
   - `chat:${sessionId}` (`useChat.ts`): Postgres changes on `messages` table (INSERT).
   - `participants:${sessionId}` (`useParticipants.ts`): Postgres changes on `participants` table (INSERT / UPDATE).
   - `session_updates:${sessionId}` (`useSession.ts`): Postgres changes on `sessions` table (UPDATE).
   - `room_commands:${sessionId}` (`MeetingRoom.tsx`): Broadcast channel for teacher `mute_all` command.

---

#### D. API Routes & Database Services
1. **`src/app/api/session/create/route.ts`**:
   - Validates input with Zod, generates 6-character uppercase alphanumeric join code, inserts `classrooms`, `sessions`, and initial `teacher` participant row.
2. **`src/app/api/session/join/route.ts`**:
   - Normalizes and validates 6-character join code, confirms active session, registers student in `participants` with upsert.
3. **`src/app/api/session/end/route.ts`**:
   - Teacher-only endpoint; updates session status to `ended` and sets `ended_at`.
4. **`src/app/api/health/route.ts`**:
   - Healthcheck returning service configuration status (Supabase, Agora, Groq, ElevenLabs).
5. **`src/services/supabase/client.ts` & `src/services/supabase/server.ts`**:
   - `supabaseBrowser` (anonymous Proxy) & `getSupabaseBrowser(userId)` (sets `x-user-id` header for RLS).
   - `supabaseServer` & `getSupabaseServer()` (bypasses RLS with service role key in API routes).

---

## 2. Logic Chain

1. **ESLint Failure in `AriaPanel.tsx:32`**:
   - **Observation**: `AriaPanel.tsx:32` contains raw text `"...automatically on Agora's low-latency network."`
   - **Reasoning**: Next.js core ESLint rules enforce `react/no-unescaped-entities` for apostrophes in raw JSX text to prevent unintended HTML entity parsing or encoding anomalies.
   - **Impact**: Causes `next lint` and `next build` to immediately abort with exit code 1.
   - **Fix**: Replace `'` with `&apos;` or JSX expression `{"Agora's"}`.

2. **ESLint Failure in `MeetingRoom.tsx:98-99`**:
   - **Observation**: `MeetingRoomInner` executes:
     ```tsx
     const {
       ariaMode, setAriaMode, ariaState, ariaPaused,
       pauseAria, resumeAria, sendCommand, voiceError,
     } = useAria({...});
     ```
     Variables `setAriaMode`, `ariaState`, `ariaPaused`, `resumeAria`, and `sendCommand` are never referenced in `MeetingRoom.tsx`.
   - **Reasoning**: The TypeScript ESLint rule `@typescript-eslint/no-unused-vars` flags declared local variables that are never read.
   - **Impact**: Causes `next lint` and `next build` to abort with exit code 1.
   - **Fix**: Restrict destructuring in `MeetingRoom.tsx` to only the used properties: `{ ariaMode, pauseAria, voiceError }`.

3. **Zod Error Handler Type Assertions in API Routes**:
   - **Observation**: `(err as any).errors.map((e: any) => e.message)` is used in `/api/session/create`, `/api/session/end`, `/api/session/join`, and `/api/summary`.
   - **Reasoning**: Inside `if (err instanceof z.ZodError)`, `err` is narrowed to `z.ZodError`, which has strongly-typed `.errors` (`z.ZodIssue[]`). The `any` cast is redundant and bypasses type safety.
   - **Fix**: Use `err.errors.map(e => e.message).join(', ')` directly.

4. **Agora RTC & Agent Audio Architecture Continuity**:
   - **Observation**: The classroom uses Agora Web SDK `agora-rtc-sdk-ng` for browser clients and `agora-agents` on the server to join AI agent with UID `100`.
   - **Reasoning**: `useAgoraMeeting` automatically plays any incoming remote audio track (`user.audioTrack?.play()`), and `AriaTile` watches `remoteUsers[100]`.
   - **Conclusion**: The integration design is clean and correctly delegates STT/LLM/TTS processing to Agora's low-latency edge agent while preserving real-time UI feedback in the frontend.

---

## 3. Caveats

1. **Environment Variables**:
   - Full end-to-end live testing of Agora RTC and Agora Agents requires valid `NEXT_PUBLIC_AGORA_APP_ID` and `AGORA_APP_CERTIFICATE` / `NEXT_AGORA_APP_CERTIFICATE`.
   - Groq post-session summary generation requires `GROQ_API_KEY`.
   - Supabase realtime and database access requires `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.
   - Lazy loaders (`lib/env.ts`, `services/supabase/server.ts`, `services/groq/groqClient.ts`) ensure build-time static evaluation passes even when environment secrets are absent during CI.
2. **Browser Support for Web Speech API**:
   - `useSpeechRecognition` relies on Chrome/Edge Web Speech API implementation (`SpeechRecognition` / `webkitSpeechRecognition`). In unsupported browsers (e.g. Firefox), speech transcription gracefully warns without breaking classroom video/audio.
3. **No Caveats Remaining on Codebase Scope**:
   - All services, hooks, components, API routes, types, and schema files in scope have been examined.

---

## 4. Conclusion & Recommended Action Plan

### Core Findings Summary
- The codebase architecture is well-structured and functional.
- The build failure blocking `npm run build` is 100% attributable to **2 files with 6 ESLint violations**:
  1. `src/components/aria/AriaPanel.tsx` (Line 32 — unescaped entity `react/no-unescaped-entities`)
  2. `src/components/meeting/MeetingRoom.tsx` (Lines 98–99 — 5 unused destructured variables `@typescript-eslint/no-unused-vars`)
- Fixing these two files will immediately resolve all ESLint and build errors, enabling `npm run build` to pass with exit code 0.

### Proposed Code Changes

#### 1. Fix `src/components/aria/AriaPanel.tsx` (Line 32)
```tsx
// BEFORE (Line 32):
          Simply use your microphone to speak with her. She handles listening and speaking automatically on Agora's low-latency network.

// AFTER:
          Simply use your microphone to speak with her. She handles listening and speaking automatically on Agora&apos;s low-latency network.
```

#### 2. Fix `src/components/meeting/MeetingRoom.tsx` (Lines 97–100)
```tsx
// BEFORE (Lines 97-100):
  const {
    ariaMode, setAriaMode, ariaState, ariaPaused,
    pauseAria, resumeAria, sendCommand, voiceError,
  } = useAria({

// AFTER:
  const { ariaMode, pauseAria, voiceError } = useAria({
```

#### 3. Optional Type-Safety Cleanups in API Routes
Replace `(err as any).errors.map((e: any) => e.message)` with `err.errors.map(e => e.message).join(', ')` in:
- `src/app/api/session/create/route.ts:74`
- `src/app/api/session/end/route.ts:42`
- `src/app/api/session/join/route.ts:67`
- `src/app/api/summary/route.ts:140`

---

## 5. Verification Method

To verify these findings and validate the subsequent implementation:

1. **Verify Lint Compliance**:
   ```bash
   npm run lint
   ```
   *Expected Output*: Exit code 0, `✔ No ESLint warnings or errors`.

2. **Verify TypeScript Typechecking**:
   ```bash
   npx tsc --noEmit
   ```
   *Expected Output*: Exit code 0, no diagnostic errors.

3. **Verify Full Production Build**:
   ```bash
   npm run build
   ```
   *Expected Output*: Exit code 0, compiled client and server pages with zero errors.

4. **Verify Unit Tests**:
   ```bash
   npx jest
   ```
   *Expected Output*: `3 passed, 3 total`.

5. **Invalidation Conditions**:
   - If modifying `useAria` in the future to expose new controls in `AriaPanel`, ensure the consumer components receive the props or use appropriate linting rules rather than leaving unused local variables in `MeetingRoom.tsx`.
