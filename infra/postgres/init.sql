-- =============================================================================
-- AROVIA Platform — PostgreSQL Initialization Script
-- Sprint DAT-01: Database Schema & Extensions
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

\i /docker-entrypoint-initdb.d/init-db.sql
