-- ============================================
-- Migration: Add price, is_active, and archived_at columns
-- Purpose: Support event pricing and automatic archival of past events
-- Date: 2025-10-19
-- ============================================

-- Step 1: Add new columns to events table
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS price NUMERIC(10,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP;

-- Step 2: Update existing events with sample prices
-- Customize these prices based on your actual events
UPDATE events SET price = CASE
  WHEN title = 'Music Concert' THEN 499.00
  WHEN title = 'Tech Expo' THEN 250.00
  WHEN title = 'Art Festival' THEN 150.00
  WHEN title = 'Food Carnival' THEN 300.00
  WHEN title = 'Startup Meetup' THEN 0.00
  WHEN title = 'Marathon' THEN 500.00
  WHEN title = 'Book Fair' THEN 100.00
  WHEN title = 'Dance Workshop' THEN 350.00
  WHEN title = 'Film Festival' THEN 200.00
  WHEN title = 'Science Exhibition' THEN 50.00
  ELSE 0.00
END
WHERE price = 0.00;

-- Step 3: Archive any past events immediately (events before today)
UPDATE events 
SET is_active = false, archived_at = NOW() 
WHERE date < CURRENT_DATE AND is_active = true;

-- Step 4: Verify the migration
SELECT event_id, title, date, price, is_active, archived_at 
FROM events 
ORDER BY date ASC;

-- ============================================
-- Rollback instructions (if needed):
-- ALTER TABLE events DROP COLUMN IF EXISTS price;
-- ALTER TABLE events DROP COLUMN IF EXISTS is_active;
-- ALTER TABLE events DROP COLUMN IF EXISTS archived_at;
-- ============================================
