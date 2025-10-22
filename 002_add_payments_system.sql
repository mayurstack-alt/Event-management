-- ============================================
-- Migration: Add Payment System & Ticket Pricing
-- Purpose: Support ticket pricing and payment transactions
-- Date: 2025-10-20
-- ============================================

-- Step 1: Add price column to events table (if not already added)
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS price NUMERIC(10,2) DEFAULT 0.00;

-- Step 2: Create payments table
CREATE TABLE IF NOT EXISTS payments (
    payment_id SERIAL PRIMARY KEY,
    booking_id INT REFERENCES bookings(booking_id) ON DELETE CASCADE,
    participant_name VARCHAR(100) NOT NULL,
    event_id INT REFERENCES events(event_id) ON DELETE CASCADE,
    event_title VARCHAR(200) NOT NULL,
    tickets_count INT NOT NULL DEFAULT 1,
    total_amount NUMERIC(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'Paid',
    transaction_id VARCHAR(100) UNIQUE NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 3: Add payment_id to bookings table (optional - for linking)
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS payment_id INT REFERENCES payments(payment_id) ON DELETE SET NULL;

-- Step 4: Update existing events with sample prices (modify as needed)
UPDATE events SET price = CASE
  WHEN title LIKE '%Concert%' THEN 499.00
  WHEN title LIKE '%Expo%' THEN 250.00
  WHEN title LIKE '%Festival%' THEN 150.00
  WHEN title LIKE '%Carnival%' THEN 300.00
  WHEN title LIKE '%Meetup%' THEN 0.00
  WHEN title LIKE '%Marathon%' THEN 500.00
  WHEN title LIKE '%Fair%' THEN 100.00
  WHEN title LIKE '%Workshop%' THEN 350.00
  WHEN title LIKE '%Film%' THEN 200.00
  WHEN title LIKE '%Exhibition%' THEN 50.00
  ELSE 99.00
END
WHERE price = 0.00 OR price IS NULL;

-- Step 5: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_event ON payments(event_id);
CREATE INDEX IF NOT EXISTS idx_payments_transaction ON payments(transaction_id);

-- Step 6: Verify the migration
SELECT 'Events table:' as info;
SELECT event_id, title, price FROM events LIMIT 5;

SELECT 'Payments table structure:' as info;
\d payments;

-- ============================================
-- Rollback instructions (if needed):
-- DROP TABLE IF EXISTS payments CASCADE;
-- ALTER TABLE bookings DROP COLUMN IF EXISTS payment_id;
-- ALTER TABLE events DROP COLUMN IF EXISTS price;
-- ============================================

-- ============================================
-- Sample payment data (for testing)
-- ============================================
-- INSERT INTO payments (booking_id, participant_name, event_id, event_title, tickets_count, total_amount, payment_method, transaction_id)
-- VALUES (1, 'Test User', 1, 'Music Concert', 2, 998.00, 'UPI', 'TXN' || EXTRACT(EPOCH FROM NOW())::BIGINT);
SELECT*FROM payments;