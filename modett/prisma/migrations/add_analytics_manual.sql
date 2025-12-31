-- Manual migration for Analytics module
-- Run this SQL directly against your PostgreSQL database

-- Create analytics schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS analytics;

-- Create event type enum
DO $$ BEGIN
    CREATE TYPE analytics.event_type_enum AS ENUM ('product_view', 'purchase');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create analytics_events table
CREATE TABLE IF NOT EXISTS analytics.analytics_events (
    event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type analytics.event_type_enum NOT NULL,
    user_id UUID,
    guest_token TEXT,
    session_id TEXT NOT NULL,
    product_id UUID NOT NULL,
    variant_id UUID,
    event_data JSONB,
    user_agent TEXT,
    ip_address TEXT,
    referrer TEXT,
    event_timestamp TIMESTAMPTZ(6) NOT NULL,
    created_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type
    ON analytics.analytics_events(event_type);

CREATE INDEX IF NOT EXISTS idx_analytics_events_product_id
    ON analytics.analytics_events(product_id);

CREATE INDEX IF NOT EXISTS idx_analytics_events_variant_id
    ON analytics.analytics_events(variant_id);

CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id
    ON analytics.analytics_events(user_id);

CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id
    ON analytics.analytics_events(session_id);

CREATE INDEX IF NOT EXISTS idx_analytics_events_event_timestamp
    ON analytics.analytics_events(event_timestamp);

-- Verify the table was created
SELECT 'Analytics schema created successfully!' as status;
SELECT tablename FROM pg_tables WHERE schemaname = 'analytics';
