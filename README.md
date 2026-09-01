# ARIA Co-Teacher

> The classroom's third voice — real-time AI that listens, adapts, and intervenes.

ARIA joins your live digital classroom as an AI co-teacher. It monitors the
conversation through Supabase Realtime, evaluates the pedagogical context with
Groq, speaks to all participants via ElevenLabs TTS streamed through Agora, and
generates a structured post-session report.

---

## Quick Start

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 18+ |
| npm | 9+ |
| Supabase project | — |
| Agora account (App ID + Certificate) | — |
| Groq API key | — |
| ElevenLabs API key *(optional)* | — |

### 1. Clone and install

```bash
git clone https://github.com/saksham456456/Aria.git
cd Aria
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
# Edit .env.local — fill in all values (see table below)
```

### 3. Set up the database

```bash
# Option A — Supabase CLI
supabase db push

# Option B — Supabase Dashboard
# Paste supabase/migrations/20250101000000_initial_schema.sql
# into the SQL Editor and click Run.
```

### 4. Run locally

```bash
npm run dev
# Open http://localhost:3000
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anonymous (public) key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key (server only) |
| `NEXT_PUBLIC_AGORA_APP_ID` | ✅ | Agora App ID |
| `AGORA_APP_CERTIFICATE` | ✅ | Agora App Certificate (for token generation) |
| `GROQ_API_KEY` | ✅ | Groq API key (LLaMA-3.3-70B) |
| `ELEVENLABS_API_KEY` | ⚠️ | ElevenLabs API key — ARIA voice is local-only without this |
| `ELEVENLABS_VOICE_ID` | ⚠️ | ElevenLabs voice ID (e.g. `21m00Tcm4TlvDq8ikWAM` for Rachel) |
| `NEXT_PUBLIC_SITE_URL` | ✅ | App base URL (e.g. `http://localhost:3000`) |

> ⚠️ **ElevenLabs is optional.** Without it, ARIA voice falls back to the browser's
> `SpeechSynthesis` API — only the teacher's browser will hear ARIA. Other participants
> will see ARIA's text in the chat panel but will not hear audio.

---

## Architecture

```
Browser (Teacher)                    Browser (Student)
├── useAgoraMeeting                  ├── useAgoraMeeting
│   └── Agora RTC client             │   └── Agora RTC client
├── useAria                          │
│   ├── useAriaVoice                 │
│   │   ├── /api/aria/tts (POST)     │
│   │   │   └── ElevenLabs TTS       │
│   │   └── Agora custom audio track │
│   └── /api/aria (POST)             │
│       └── Groq LLaMA-3.3-70B       │
└── useSpeechRecognition             │
    └── transcript_segments →        │
        Supabase Realtime ──────────→│
                                     │
                    Supabase Postgres (shared state)
                    ├── sessions, participants, messages
                    ├── transcript_segments, aria_events
                    ├── learning_gaps, session_summaries
                    └── Realtime subscriptions
```

### Key design decisions

- **One Agora client per meeting.** ARIA audio is published as a custom audio
  track on the *teacher's existing client* — there is no separate bot UID.
- **Teacher's browser hosts ARIA.** The teacher's tab calls `/api/aria` and
  `/api/aria/tts`. Students receive ARIA audio via Agora and text via Supabase.
- **Server-side uses service role key.** All API routes use `supabaseServer`
  which bypasses RLS. Browser queries use the anon key + RLS policies that check
  `x-user-id` headers.
- **Speech recognition is Chrome-only.** The Web Speech API is not available in
  Firefox or Safari. Transcript segments trigger ARIA evaluation automatically.

---

## Known Limitations (Prototype)

| Limitation | Notes |
|------------|-------|
| Speech recognition | Chrome/Edge only (Web Speech API) |
| ARIA audio hosting | Teacher's browser must stay connected |
| RLS enforcement | Uses custom `x-user-id` header, not Supabase Auth JWT |
| No authentication | `app_user_id` stored in `localStorage` — not authenticated |
| ElevenLabs fallback | Without API key, only teacher hears ARIA via `SpeechSynthesis` |

---

## Production Checklist

- [ ] Replace `localStorage` UUID with Supabase Auth for identity
- [ ] Update RLS policies to use `auth.uid()` instead of `x-user-id` header
- [ ] Add rate limiting to `/api/aria` and `/api/aria/tts`
- [ ] Move ARIA evaluation to a background queue (Supabase Edge Functions)
- [ ] Add monitoring / error tracking (Sentry, Axiom)
- [ ] Set `NEXT_PUBLIC_SITE_URL` to your production domain
