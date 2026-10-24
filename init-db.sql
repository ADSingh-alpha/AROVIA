-- =============================================================================
-- AROVIA Platform — Comprehensive Database Initialization Script
-- Sprint DAT-01: PostgreSQL Database Schema Design
-- Supports: Users (RBAC), Startups, Pitches, Term Sheets, Commitments, Cap-Table Ledgers, Live Rooms, Audit Logs
-- =============================================================================

-- Enable UUID & Text Search extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- -----------------------------------------------------------------------------
-- 1. USERS & RBAC TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('founder', 'investor', 'admin')),
    bio TEXT,
    avatar_url VARCHAR(512),
    organization VARCHAR(255),
    accredited_investor BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- -----------------------------------------------------------------------------
-- 2. STARTUPS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS startups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    founder_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    tagline VARCHAR(500),
    description TEXT,
    industry VARCHAR(100) NOT NULL,
    stage VARCHAR(50) NOT NULL DEFAULT 'Seed',
    website VARCHAR(255),
    valuation_target NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    funding_goal NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    equity_offered_percent NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    total_shares BIGINT NOT NULL DEFAULT 10000000,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_startups_founder ON startups(founder_id);
CREATE INDEX IF NOT EXISTS idx_startups_industry ON startups(industry);

-- -----------------------------------------------------------------------------
-- 3. PITCHES TABLE (PITCH PIPELINE)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pitches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    startup_id UUID NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    summary TEXT,
    deck_file_url VARCHAR(1024),
    video_url VARCHAR(1024),
    ask_amount NUMERIC(15, 2) NOT NULL,
    equity_percentage NUMERIC(5, 2) NOT NULL,
    valuation NUMERIC(15, 2) GENERATED ALWAYS AS (
        CASE WHEN equity_percentage > 0 THEN (ask_amount / (equity_percentage / 100.0)) ELSE 0.00 END
    ) STORED,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'LIVE', 'FUNDED', 'REJECTED')),
    live_room_id VARCHAR(100),
    scheduled_at TIMESTAMPTZ,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pitches_startup ON pitches(startup_id);
CREATE INDEX IF NOT EXISTS idx_pitches_status ON pitches(status);

-- -----------------------------------------------------------------------------
-- 4. FUNDING TERMS & TERM SHEETS (INVESTMENT LEDGER)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS funding_terms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pitch_id UUID NOT NULL REFERENCES pitches(id) ON DELETE CASCADE,
    investor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    offered_amount NUMERIC(15, 2) NOT NULL,
    equity_percent NUMERIC(5, 2) NOT NULL,
    implied_valuation NUMERIC(15, 2) NOT NULL,
    advisory_shares_percent NUMERIC(5, 2) DEFAULT 0.00,
    board_seat BOOLEAN DEFAULT FALSE,
    special_conditions TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'PROPOSED' CHECK (status IN ('PROPOSED', 'COUNTERED', 'ACCEPTED', 'REJECTED', 'SUPERSEDED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_funding_terms_pitch ON funding_terms(pitch_id);
CREATE INDEX IF NOT EXISTS idx_funding_terms_investor ON funding_terms(investor_id);
CREATE INDEX IF NOT EXISTS idx_funding_terms_status ON funding_terms(status);

-- -----------------------------------------------------------------------------
-- 5. INVESTMENT COMMITMENTS & DEAL CLOSURES
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS investment_commitments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    term_sheet_id UUID REFERENCES funding_terms(id) ON DELETE SET NULL,
    pitch_id UUID NOT NULL REFERENCES pitches(id) ON DELETE CASCADE,
    startup_id UUID NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
    investor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount NUMERIC(15, 2) NOT NULL,
    equity_percent NUMERIC(5, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'COMMITTED' CHECK (status IN ('COMMITTED', 'ESCROW_FUNDED', 'COMPLETED', 'CANCELLED')),
    transaction_reference VARCHAR(100) UNIQUE NOT NULL,
    closure_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_commitments_pitch ON investment_commitments(pitch_id);
CREATE INDEX IF NOT EXISTS idx_commitments_startup ON investment_commitments(startup_id);
CREATE INDEX IF NOT EXISTS idx_commitments_investor ON investment_commitments(investor_id);

-- -----------------------------------------------------------------------------
-- 6. CAP-TABLE LEDGERS (ACID AUDITABLE EQUITY LEDGER)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cap_table_ledgers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    startup_id UUID NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
    stakeholder_id UUID REFERENCES users(id) ON DELETE SET NULL,
    stakeholder_name VARCHAR(255) NOT NULL,
    stakeholder_type VARCHAR(50) NOT NULL CHECK (stakeholder_type IN ('founder', 'investor', 'employee_pool', 'advisor')),
    shares_allocated BIGINT NOT NULL,
    ownership_percentage NUMERIC(7, 4) NOT NULL,
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('INITIAL_EQUITY', 'SERIES_SEED_INVESTMENT', 'DILUTION_ADJUSTMENT', 'TRANSFER')),
    effective_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cap_table_startup ON cap_table_ledgers(startup_id);
CREATE INDEX IF NOT EXISTS idx_cap_table_stakeholder ON cap_table_ledgers(stakeholder_id);

-- -----------------------------------------------------------------------------
-- 7. LIVE ROOM SESSIONS (WEBRTC SIGNALING)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS live_room_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id VARCHAR(100) UNIQUE NOT NULL,
    pitch_id UUID REFERENCES pitches(id) ON DELETE CASCADE,
    host_founder_id UUID REFERENCES users(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    started_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_live_rooms_room_id ON live_room_sessions(room_id);

-- -----------------------------------------------------------------------------
-- 8. LIVE Q&A LOGS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS live_qa_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id VARCHAR(100) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    author_name VARCHAR(255) NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    question TEXT NOT NULL,
    answer TEXT,
    answered_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_qa_logs_room ON live_qa_logs(room_id);

-- -----------------------------------------------------------------------------
-- 9. AUDIT LOGS (KAFKA EVENT REPLAY & SYSTEM AUDIT)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    payload JSONB,
    actor_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- -----------------------------------------------------------------------------
-- 10. SEED INITIAL USERS (Password: 'AroviaPass2026!')
-- Bcrypt hash: $2b$12$6U/9Z7K6v1wFz1jO07u5veY2Hk4R6X3oB5T6s7u8v9w0x1y2z3a4b (example)
-- -----------------------------------------------------------------------------
-- Insert initial system users if table is empty
INSERT INTO users (id, email, hashed_password, full_name, role, organization, accredited_investor)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'admin@arovia.io', '$2b$12$e6mZ8jM3ZlIq4z7P9hVdQuw5qH9U/1l8zO8yZgY3pC6gY6e8p2u.y', 'System Administrator', 'admin', 'AROVIA HQ', TRUE),
    ('22222222-2222-2222-2222-222222222222', 'founder@neurosync.ai', '$2b$12$e6mZ8jM3ZlIq4z7P9hVdQuw5qH9U/1l8zO8yZgY3pC6gY6e8p2u.y', 'Elena Rostova', 'founder', 'NeuroSync AI', FALSE),
    ('33333333-3333-3333-3333-333333333333', 'investor@sequoia-demo.com', '$2b$12$e6mZ8jM3ZlIq4z7P9hVdQuw5qH9U/1l8zO8yZgY3pC6gY6e8p2u.y', 'Marcus Vance (Angel Shark)', 'investor', 'Vance Capital Partners', TRUE)
ON CONFLICT (email) DO NOTHING;
