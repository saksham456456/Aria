-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- CLASSROOMS
-- ============================================================
CREATE TABLE classrooms (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT NOT NULL,
  subject             TEXT NOT NULL,
  topic               TEXT NOT NULL,
  grade               TEXT NOT NULL,
  lesson_description  TEXT NOT NULL,
  join_code           TEXT NOT NULL UNIQUE,
  teacher_app_user_id TEXT NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- SESSIONS
-- ============================================================
CREATE TABLE sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id  UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  status        TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'ending', 'ended')),
  started_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at      TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sessions_classroom_id ON sessions(classroom_id);
CREATE INDEX idx_sessions_status ON sessions(status);

-- ============================================================
-- PARTICIPANTS
-- ============================================================
CREATE TABLE participants (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  app_user_id     TEXT NOT NULL,
  name            TEXT NOT NULL,
  role            TEXT NOT NULL CHECK (role IN ('teacher', 'student')),
  learning_level  TEXT CHECK (learning_level IN ('beginner', 'intermediate', 'advanced')),
  language        TEXT CHECK (language IN ('en', 'hi', 'en+hi')),
  joined_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  left_at         TIMESTAMPTZ,
  UNIQUE(session_id, app_user_id)
);

CREATE INDEX idx_participants_session_id ON participants(session_id);
CREATE INDEX idx_participants_app_user_id ON participants(app_user_id);

-- ============================================================
-- MESSAGES
-- ============================================================
CREATE TABLE messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  participant_id  UUID REFERENCES participants(id) ON DELETE SET NULL,
  role            TEXT NOT NULL CHECK (role IN ('teacher', 'student', 'aria')),
  sender_name     TEXT NOT NULL,
  text            TEXT NOT NULL CHECK (char_length(text) <= 1000),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_session_id ON messages(session_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- ============================================================
-- TRANSCRIPT SEGMENTS
-- ============================================================
CREATE TABLE transcript_segments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  participant_id  UUID REFERENCES participants(id) ON DELETE SET NULL,
  speaker_role    TEXT NOT NULL,
  speaker_name    TEXT NOT NULL,
  text            TEXT NOT NULL,
  language        TEXT,
  start_time      TIMESTAMPTZ,
  end_time        TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_transcript_session_id ON transcript_segments(session_id);
CREATE INDEX idx_transcript_created_at ON transcript_segments(created_at);

-- ============================================================
-- ARIA EVENTS
-- ============================================================
CREATE TABLE aria_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  event_type      TEXT NOT NULL CHECK (event_type IN (
                    'explanation', 'quiz', 'summary', 'feedback',
                    'observation', 'teacher_command', 'speech_started',
                    'speech_finished', 'paused', 'resumed'
                  )),
  trigger_text    TEXT,
  response_text   TEXT,
  urgency         INTEGER CHECK (urgency BETWEEN 0 AND 10),
  target          TEXT,
  language        TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_aria_events_session_id ON aria_events(session_id);
CREATE INDEX idx_aria_events_created_at ON aria_events(created_at);

-- ============================================================
-- LEARNING GAPS
-- ============================================================
CREATE TABLE learning_gaps (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id            UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  concept               TEXT NOT NULL,
  description           TEXT NOT NULL,
  affected_student_ids  TEXT[] NOT NULL DEFAULT '{}',
  confidence            DECIMAL(3,2) CHECK (confidence BETWEEN 0 AND 1),
  evidence              TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(session_id, concept)
);

CREATE INDEX idx_learning_gaps_session_id ON learning_gaps(session_id);

-- ============================================================
-- SESSION SUMMARIES
-- ============================================================
CREATE TABLE session_summaries (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id                UUID NOT NULL UNIQUE REFERENCES sessions(id) ON DELETE CASCADE,
  overview                  TEXT,
  topics_covered            TEXT[] DEFAULT '{}',
  common_learning_gaps      JSONB DEFAULT '[]',
  student_insights          JSONB DEFAULT '[]',
  aria_interventions_count  INTEGER DEFAULT 0,
  recommendations           TEXT,
  generated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- ENABLE REALTIME
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE participants;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE aria_events;
ALTER PUBLICATION supabase_realtime ADD TABLE learning_gaps;
ALTER PUBLICATION supabase_realtime ADD TABLE transcript_segments;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE classrooms         ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions           ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants       ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages           ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcript_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE aria_events        ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_gaps      ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_summaries  ENABLE ROW LEVEL SECURITY;

-- For the prototype, we use service role on the server (bypasses RLS).
-- On the client (anon key), we allow reading session data if the user is a participant.
-- Full production RLS would require Supabase Auth JWT claims.

-- Classrooms: readable by anyone with the join code (handled server-side)
-- No direct client-side classroom reads needed.

-- Sessions: participants can read their own sessions
CREATE POLICY "session_read_by_participant"
  ON sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM participants p
      WHERE p.session_id = sessions.id
        AND p.app_user_id = (current_setting('request.headers', true)::json->>'x-user-id')
    )
  );

-- Participants: visible to everyone in the same session
CREATE POLICY "participants_read_same_session"
  ON participants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM participants p2
      WHERE p2.session_id = participants.session_id
        AND p2.app_user_id = (current_setting('request.headers', true)::json->>'x-user-id')
    )
  );

-- Participants: updatable by themselves (for leaving)
CREATE POLICY "participants_update_self"
  ON participants FOR UPDATE
  USING (
    app_user_id = (current_setting('request.headers', true)::json->>'x-user-id')
  );

-- Sessions: updatable by teacher (for ending)
CREATE POLICY "sessions_update_by_teacher"
  ON sessions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM participants p
      WHERE p.session_id = sessions.id
        AND p.role = 'teacher'
        AND p.app_user_id = (current_setting('request.headers', true)::json->>'x-user-id')
    )
  );

-- Messages: readable by session participants
CREATE POLICY "messages_read_by_participant"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM participants p
      WHERE p.session_id = messages.session_id
        AND p.app_user_id = (current_setting('request.headers', true)::json->>'x-user-id')
    )
  );

-- Messages: insertable by session participants
CREATE POLICY "messages_insert_by_participant"
  ON messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM participants p
      WHERE p.session_id = messages.session_id
        AND p.app_user_id = (current_setting('request.headers', true)::json->>'x-user-id')
    )
  );

-- ARIA events: readable by session participants
CREATE POLICY "aria_events_read_by_participant"
  ON aria_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM participants p
      WHERE p.session_id = aria_events.session_id
        AND p.app_user_id = (current_setting('request.headers', true)::json->>'x-user-id')
    )
  );

-- Learning gaps: readable by session participants
CREATE POLICY "learning_gaps_read_by_participant"
  ON learning_gaps FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM participants p
      WHERE p.session_id = learning_gaps.session_id
        AND p.app_user_id = (current_setting('request.headers', true)::json->>'x-user-id')
    )
  );

-- Transcript segments: readable by session participants
CREATE POLICY "transcript_read_by_participant"
  ON transcript_segments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM participants p
      WHERE p.session_id = transcript_segments.session_id
        AND p.app_user_id = (current_setting('request.headers', true)::json->>'x-user-id')
    )
  );

-- Transcript segments: insertable by participants (for speech recognition)
CREATE POLICY "transcript_insert_by_participant"
  ON transcript_segments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM participants p
      WHERE p.session_id = transcript_segments.session_id
        AND p.app_user_id = (current_setting('request.headers', true)::json->>'x-user-id')
    )
  );

-- Session summaries: readable by teacher only
CREATE POLICY "summary_read_by_teacher"
  ON session_summaries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM participants p
      WHERE p.session_id = session_summaries.session_id
        AND p.app_user_id = (current_setting('request.headers', true)::json->>'x-user-id')
        AND p.role = 'teacher'
    )
  );
