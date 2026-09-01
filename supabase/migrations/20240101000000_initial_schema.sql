-- Create custom types
CREATE TYPE session_status AS ENUM ('active', 'ending', 'ended');
CREATE TYPE participant_role AS ENUM ('teacher', 'student', 'aria');
CREATE TYPE learning_level AS ENUM ('beginner', 'intermediate', 'advanced');

-- Classrooms
CREATE TABLE classrooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    topic TEXT NOT NULL,
    grade TEXT NOT NULL,
    lesson_description TEXT NOT NULL,
    join_code TEXT NOT NULL UNIQUE,
    teacher_app_user_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Sessions
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    classroom_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'ending', 'ended')),
    started_at TIMESTAMPTZ DEFAULT now(),
    ended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Participants
CREATE TABLE participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    app_user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('teacher', 'student', 'aria')),
    learning_level TEXT,
    language TEXT,
    joined_at TIMESTAMPTZ DEFAULT now(),
    left_at TIMESTAMPTZ,
    UNIQUE(session_id, app_user_id)
);

-- Messages
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    participant_id UUID REFERENCES participants(id) ON DELETE SET NULL,
    role TEXT NOT NULL,
    sender_name TEXT NOT NULL,
    text TEXT NOT NULL CHECK (char_length(text) <= 1000),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Transcript Segments
CREATE TABLE transcript_segments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
    speaker_role TEXT NOT NULL,
    speaker_name TEXT NOT NULL,
    text TEXT NOT NULL,
    language TEXT,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ARIA Events
CREATE TABLE aria_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    trigger_text TEXT,
    response_text TEXT,
    urgency INTEGER CHECK (urgency BETWEEN 0 AND 10),
    target TEXT,
    language TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Learning Gaps
CREATE TABLE learning_gaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    concept TEXT NOT NULL,
    description TEXT NOT NULL,
    affected_student_ids TEXT[],
    confidence DECIMAL(3,2) CHECK (confidence BETWEEN 0 AND 1),
    evidence TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(session_id, concept)
);

-- Session Summaries
CREATE TABLE session_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL UNIQUE REFERENCES sessions(id) ON DELETE CASCADE,
    overview TEXT,
    topics_covered TEXT[],
    common_learning_gaps JSONB,
    student_insights JSONB,
    aria_interventions_count INTEGER,
    recommendations TEXT,
    generated_at TIMESTAMPTZ DEFAULT now()
);

-- Configure RLS
ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcript_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE aria_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_gaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_summaries ENABLE ROW LEVEL SECURITY;

-- Note: We are using a simplified auth mechanism passing 'app_user_id' in headers
-- Because Supabase RLS natively works best with its own auth.uid(), and we are NOT using Supabase Auth,
-- our application backend (API routes) will act as a privileged service utilizing SUPABASE_SERVICE_ROLE_KEY
-- to perform CRUD, or we could set custom claims.
-- For this prototype, we'll allow all read/write from authenticated server/anon for now, but lock it down practically in API layer.
-- Here we'll define very basic policies allowing anon/service_role to operate, while backend enforces app_user_id.

CREATE POLICY "Allow all" ON classrooms FOR ALL USING (true);
CREATE POLICY "Allow all" ON sessions FOR ALL USING (true);
CREATE POLICY "Allow all" ON participants FOR ALL USING (true);
CREATE POLICY "Allow all" ON messages FOR ALL USING (true);
CREATE POLICY "Allow all" ON transcript_segments FOR ALL USING (true);
CREATE POLICY "Allow all" ON aria_events FOR ALL USING (true);
CREATE POLICY "Allow all" ON learning_gaps FOR ALL USING (true);
CREATE POLICY "Allow all" ON session_summaries FOR ALL USING (true);

-- To achieve true RLS without Supabase Auth, we would pass a JWT signed by our server,
-- which we extract using `current_setting('request.jwt.claims', true)::json->>'app_user_id'`.
-- We will document this simplified prototype approach as instructed.
