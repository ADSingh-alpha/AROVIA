-- =============================================================================
-- AROVIA Platform — PostgreSQL Initialization Script
-- Runs once when the container is first created.
-- =============================================================================

-- Create application databases for each service
CREATE DATABASE arovia_auth   WITH OWNER arovia_user;
CREATE DATABASE arovia_pitch  WITH OWNER arovia_user;
CREATE DATABASE arovia_ledger WITH OWNER arovia_user;

-- Grant all privileges
GRANT ALL PRIVILEGES ON DATABASE arovia_auth   TO arovia_user;
GRANT ALL PRIVILEGES ON DATABASE arovia_pitch  TO arovia_user;
GRANT ALL PRIVILEGES ON DATABASE arovia_ledger TO arovia_user;

-- Enable UUID extension on each database
\c arovia_db
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- for fuzzy text search

\c arovia_auth
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\c arovia_pitch
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

\c arovia_ledger
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
