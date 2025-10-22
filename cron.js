// ============================================
// Cron Job: Automatic archival of past events
// Purpose: Marks events as inactive when their date has passed
// Schedule: Runs daily at 00:05 server local time
// ============================================

import cron from 'node-cron';
import pool from './db.js';

// Schedule: '5 0 * * *' = At 00:05 every day
// Format: minute hour day month weekday
cron.schedule('5 0 * * *', async () => {
  try {
    console.log('[CRON] Starting past events archival job...');
    
    const result = await pool.query(
      `UPDATE events 
       SET is_active = false, archived_at = NOW() 
       WHERE date < CURRENT_DATE AND is_active = true
       RETURNING event_id, title, date`
    );
    
    if (result.rows.length > 0) {
      console.log(`[CRON] ✅ Archived ${result.rows.length} past event(s):`);
      result.rows.forEach(event => {
        console.log(`  - ${event.title} (${event.date})`);
      });
    } else {
      console.log('[CRON] ℹ️  No past events to archive');
    }
  } catch (err) {
    console.error('[CRON] ❌ Error archiving past events:', err);
  }
});

console.log('✅ Cron job scheduled: Archive past events daily at 00:05');

// Optional: Export a manual trigger function for testing
export async function archivePastEventsNow() {
  try {
    console.log('[MANUAL] Archiving past events...');
    
    const result = await pool.query(
      `UPDATE events 
       SET is_active = false, archived_at = NOW() 
       WHERE date < CURRENT_DATE AND is_active = true
       RETURNING event_id, title, date`
    );
    
    console.log(`[MANUAL] ✅ Archived ${result.rows.length} event(s)`);
    return result.rows;
  } catch (err) {
    console.error('[MANUAL] ❌ Error:', err);
    throw err;
  }
}
