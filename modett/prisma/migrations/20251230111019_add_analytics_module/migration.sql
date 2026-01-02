-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "analytics";

-- CreateEnum
CREATE TYPE "analytics"."event_type_enum" AS ENUM ('product_view', 'purchase');

-- CreateTable
CREATE TABLE "analytics"."analytics_events" (
    "event_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "event_type" "analytics"."event_type_enum" NOT NULL,
    "user_id" UUID,
    "guest_token" TEXT,
    "session_id" TEXT NOT NULL,
    "product_id" UUID NOT NULL,
    "variant_id" UUID,
    "event_data" JSONB,
    "user_agent" TEXT,
    "ip_address" TEXT,
    "referrer" TEXT,
    "event_timestamp" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("event_id")
);

-- CreateIndex
CREATE INDEX "idx_analytics_events_event_type" ON "analytics"."analytics_events"("event_type");

-- CreateIndex
CREATE INDEX "idx_analytics_events_product_id" ON "analytics"."analytics_events"("product_id");

-- CreateIndex
CREATE INDEX "idx_analytics_events_variant_id" ON "analytics"."analytics_events"("variant_id");

-- CreateIndex
CREATE INDEX "idx_analytics_events_user_id" ON "analytics"."analytics_events"("user_id");

-- CreateIndex
CREATE INDEX "idx_analytics_events_session_id" ON "analytics"."analytics_events"("session_id");

-- CreateIndex
CREATE INDEX "idx_analytics_events_event_timestamp" ON "analytics"."analytics_events"("event_timestamp");
