-- Supabase Database Schema for Tinder for Dinner
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION
IF NOT EXISTS "uuid-ossp";

-- Create sessions table
CREATE TABLE
IF NOT EXISTS sessions
(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4
(),
    session_code VARCHAR
(20) UNIQUE NOT NULL,
    host_id VARCHAR
(255) NOT NULL,
    max_participants INTEGER DEFAULT 4,
    requires_all_to_match BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT false,
    created_at TIMESTAMP
WITH TIME ZONE DEFAULT NOW
(),
    updated_at TIMESTAMP
WITH TIME ZONE DEFAULT NOW
()
);

-- Create session_participants table
CREATE TABLE
IF NOT EXISTS session_participants
(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4
(),
    session_id UUID REFERENCES sessions
(id) ON
DELETE CASCADE,
    user_id VARCHAR(255)
NOT NULL,
    user_name VARCHAR
(255) NOT NULL,
    user_email VARCHAR
(255) NOT NULL,
    joined_at TIMESTAMP
WITH TIME ZONE DEFAULT NOW
(),
    is_active BOOLEAN DEFAULT true,
    current_swipe_count INTEGER DEFAULT 0
);

-- Create session_swipes table
CREATE TABLE
IF NOT EXISTS session_swipes
(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4
(),
    session_id UUID REFERENCES sessions
(id) ON
DELETE CASCADE,
    user_id VARCHAR(255)
NOT NULL,
    recipe_id VARCHAR
(255) NOT NULL,
    is_like BOOLEAN NOT NULL,
    created_at TIMESTAMP
WITH TIME ZONE DEFAULT NOW
()
);

-- Create session_matches table
CREATE TABLE
IF NOT EXISTS session_matches
(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4
(),
    session_id UUID REFERENCES sessions
(id) ON
DELETE CASCADE,
    recipe_id VARCHAR(255)
NOT NULL,
    created_at TIMESTAMP
WITH TIME ZONE DEFAULT NOW
()
);

-- Create indexes for better performance
CREATE INDEX
IF NOT EXISTS idx_sessions_code ON sessions
(session_code);
CREATE INDEX
IF NOT EXISTS idx_session_participants_session_id ON session_participants
(session_id);
CREATE INDEX
IF NOT EXISTS idx_session_participants_user_id ON session_participants
(user_id);
CREATE INDEX
IF NOT EXISTS idx_session_swipes_session_id ON session_swipes
(session_id);
CREATE INDEX
IF NOT EXISTS idx_session_swipes_recipe_id ON session_swipes
(recipe_id);
CREATE INDEX
IF NOT EXISTS idx_session_matches_session_id ON session_matches
(session_id);

-- Create function to increment swipe count
CREATE OR REPLACE FUNCTION increment_swipe_count
(p_session_id UUID, p_user_id VARCHAR)
RETURNS VOID AS $$
BEGIN
    UPDATE session_participants 
    SET current_swipe_count = current_swipe_count + 1
    WHERE session_id = p_session_id AND user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column
()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW
();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_sessions_updated_at 
    BEFORE
UPDATE ON sessions 
    FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column
();

-- Enable Row Level Security (RLS)
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_matches ENABLE ROW LEVEL SECURITY;

-- Create policies for sessions table
CREATE POLICY "Sessions are viewable by everyone" ON sessions
    FOR
SELECT USING (true);

CREATE POLICY "Users can create sessions" ON sessions
    FOR
INSERT WITH CHECK
    (true)
;

CREATE POLICY "Only hosts can update sessions" ON sessions
    FOR
UPDATE USING (auth.uid()
::text = host_id);

-- Create policies for session_participants table
CREATE POLICY "Participants are viewable by session members" ON session_participants
    FOR
SELECT USING (true);

CREATE POLICY "Users can join sessions" ON session_participants
    FOR
INSERT WITH CHECK
    (true)
;

CREATE POLICY "Users can update their own participation" ON session_participants
    FOR
UPDATE USING (auth.uid()
::text = user_id);

-- Create policies for session_swipes table
CREATE POLICY "Swipes are viewable by session members" ON session_swipes
    FOR
SELECT USING (true);

CREATE POLICY "Users can record their own swipes" ON session_swipes
    FOR
INSERT WITH CHECK (auth.uid()::
text
=
user_id
);

-- Create policies for session_matches table
CREATE POLICY "Matches are viewable by everyone" ON session_matches
    FOR
SELECT USING (true);

CREATE POLICY "System can create matches" ON session_matches
    FOR
INSERT WITH CHECK
    (true)
;
