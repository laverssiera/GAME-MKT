-- Create GAME MKT database
CREATE DATABASE IF NOT EXISTS game_mkt;

-- Switch to game_mkt database
\c game_mkt;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Set default timezone
SET timezone TO 'America/Sao_Paulo';
