-- ============================================
-- One-time command to archive past events
-- Run this manually after migration if needed
-- ============================================

UPDATE events 
SET is_active = false, archived_at = NOW() 
WHERE date < CURRENT_DATE AND is_active = true;

-- Verify archived events
SELECT event_id, title, date, is_active, archived_at 
FROM events 
WHERE is_active = false
ORDER BY date DESC;
