-- Initialize PostgreSQL database for Prompt Management Platform
-- This script should be run as a superuser to set up the database and user

-- Create database
CREATE DATABASE promptdb;

-- Create user (change password in production)
CREATE USER promptuser WITH ENCRYPTED PASSWORD 'promptpass123';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE promptdb TO promptuser;

-- Connect to the database
\c promptdb;

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO promptuser;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO promptuser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO promptuser;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO promptuser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO promptuser;

-- Create a function for updating updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Note: Triggers will be added by Prisma migrations
