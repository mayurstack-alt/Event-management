# Implementation Checklist - Event Management Features

## 📋 Step-by-Step Implementation Guide

Follow this checklist to implement all three features correctly.

---

## Phase 1: Database Setup ✅

### Step 1.1: Backup Current Database
```powershell
# Create backup before migration
pg_dump -U postgres event_management > backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql
```

### Step 1.2: Apply Migration
```powershell
# Connect to PostgreSQL
psql -U postgres -d event_management

# Run migration script
\i 'c:/DBMS Project isFinal/Backend/migrations/001_add_price_and_archival.sql'

# Verify changes
\d events
SELECT * FROM events ORDER BY date ASC;
```

**Verification:**
- [ ] `price` column exists (NUMERIC(10,2))
- [ ] `is_active` column exists (BOOLEAN)
- [ ] `archived_at` column exists (TIMESTAMP)
- [ ] Existing events have prices assigned
- [ ] Past events are marked `is_active = false`

---

## Phase 2: Backend Setup ✅

### Step 2.1: Install Dependencies
```powershell
cd "c:\DBMS Project isFinal\Backend"
npm install node-cron
```

**Verification:**
- [ ] `node-cron` appears in `package.json` dependencies
- [ ] No installation errors

### Step 2.2: Verify File Changes
Check that these files were updated:

**Backend Files:**
- [ ] `Backend/routes/events.js` - Updated GET/POST/PUT with price support
- [ ] `Backend/routes/booking.js` - Added validation for past events
- [ ] `Backend/cron.js` - Created (cron job for archival)
- [ ] `Backend/server.js` - Imports cron.js
- [ ] `Backend/package.json` - Added node-cron dependency

### Step 2.3: Start Backend Server
```powershell
cd "c:\DBMS Project isFinal\Backend"
npm start
```

**Expected Console Output:**
```
✅ Connected to PostgreSQL
✅ Cron job scheduled: Archive past events daily at 00:05
🚀 Server running on http://localhost:3000
```

**Verification:**
- [ ] Server starts without errors
- [ ] Database connection successful
- [ ] Cron job scheduled message appears

---

## Phase 3: Frontend Setup ✅

### Step 3.1: Verify File Changes
Check that these files were updated:

**Frontend Files:**
- [ ] `Frontend/main.js` - Updated to display prices and handle past events
- [ ] `Frontend/style.css` - Added `.price-badge` and `.event-past` styles

### Step 3.2: Test Frontend
```powershell
# Open in browser
start "c:\DBMS Project isFinal\Frontend\index.html"
```

**Verification:**
- [ ] Events load successfully
- [ ] Price badge displays on each event card
- [ ] Events sorted by date (earliest first)
- [ ] No past events visible
- [ ] Modal shows price when viewing event details

---

## Phase 4: Feature Testing 🧪

### Test 4.1: GET Events API
```powershell
curl http://localhost:3000/api/events
```

**Checklist:**
- [ ] Returns only active events (`is_active = true`)
- [ ] Returns only future events (`date >= today`)
- [ ] Events sorted by date ascending
- [ ] Each event has `price` field
- [ ] Response is valid JSON

### Test 4.2: Create Event with Price
```powershell
# 1. Login as Organizer
$loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"organizer@test.com","password":"password123","role":"Organizer"}'
$token = $loginResponse.token

# 2. Create event
$headers = @{ Authorization = "Bearer $token" }
$body = @{
    title = "Test Event"
    date = "2025-12-25"
    venue = "Test Venue"
    description = "Test Description"
    price = 299.99
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/events" -Method Post -Headers $headers -ContentType "application/json" -Body $body
```

**Checklist:**
- [ ] Event created successfully
- [ ] Price saved correctly (299.99)
- [ ] `is_active` defaults to `true`
- [ ] Event appears in GET /api/events

### Test 4.3: Booking Validation
```powershell
# 1. Login as Participant
$loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"participant@test.com","password":"password123","role":"Participant"}'
$token = $loginResponse.token

# 2. Try to book a future event (should succeed)
$headers = @{ Authorization = "Bearer $token" }
$body = @{
    event_id = 1
    quantity = 2
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/bookings" -Method Post -Headers $headers -ContentType "application/json" -Body $body
```

**Checklist:**
- [ ] Booking future event succeeds
- [ ] Booking past event returns 422 error
- [ ] Error message: "This event date has passed and bookings are closed"
- [ ] Booking inactive event returns 422 error

### Test 4.4: Cron Job (Manual Trigger)
```sql
-- Run this SQL to manually test archival
UPDATE events 
SET is_active = false, archived_at = NOW() 
WHERE date < CURRENT_DATE AND is_active = true
RETURNING event_id, title, date;
```

**Checklist:**
- [ ] Past events marked `is_active = false`
- [ ] `archived_at` timestamp set
- [ ] Past events no longer appear in GET /api/events
- [ ] Cannot book archived events

### Test 4.5: Frontend Integration
**Manual Testing Steps:**

1. **Homepage Event Cards:**
   - [ ] Events display with price badges
   - [ ] Free events show "Free" instead of price
   - [ ] Events sorted by date (earliest first)
   - [ ] No past events visible

2. **Event Details Modal:**
   - [ ] Price displayed correctly
   - [ ] "Book Event" button enabled for future events
   - [ ] Past events show warning message
   - [ ] Past events have disabled "Booking Closed" button

3. **Booking Flow:**
   - [ ] Clicking "Book Event" redirects to participant page
   - [ ] Login required for booking
   - [ ] Only participants can book

---

## Phase 5: Production Deployment 🚀

### Step 5.1: Environment Configuration
Create `.env` file in Backend folder:
```env
# Database
DB_USER=postgres
DB_HOST=localhost
DB_NAME=event_management
DB_PASSWORD=your_password
DB_PORT=5432

# JWT
JWT_SECRET=your_secret_key_here

# Server
PORT=3000
NODE_ENV=production

# Cron (optional - disable in dev)
ENABLE_CRON=true
```

### Step 5.2: Update db.js for Environment Variables
```javascript
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});
```

### Step 5.3: Optional - Conditional Cron
Update `server.js`:
```javascript
// Only enable cron in production or if explicitly enabled
if (process.env.ENABLE_CRON === 'true') {
  import('./cron.js');
  console.log('✅ Cron jobs enabled');
}
```

### Step 5.4: Database Indexes (Performance)
```sql
-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_events_date_active 
ON events(date, is_active);

CREATE INDEX IF NOT EXISTS idx_events_active 
ON events(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_bookings_user 
ON bookings(user_id);

CREATE INDEX IF NOT EXISTS idx_bookings_event 
ON bookings(event_id);
```

**Checklist:**
- [ ] `.env` file created with correct values
- [ ] Environment variables loaded in `db.js`
- [ ] Database indexes created
- [ ] Server restarts successfully

---

## Phase 6: Monitoring & Maintenance 📊

### Step 6.1: Verify Cron Execution
```powershell
# Check server logs daily for cron output
# Expected log at 00:05 daily:
# [CRON] Starting past events archival job...
# [CRON] ✅ Archived X past event(s)
```

### Step 6.2: Monitor Database
```sql
-- Check archived events
SELECT COUNT(*) as archived_count 
FROM events 
WHERE is_active = false;

-- Check active future events
SELECT COUNT(*) as active_count 
FROM events 
WHERE is_active = true AND date >= CURRENT_DATE;

-- Recent bookings
SELECT e.title, COUNT(*) as booking_count
FROM bookings b
JOIN events e ON b.event_id = e.event_id
WHERE b.booked_at >= NOW() - INTERVAL '7 days'
GROUP BY e.title
ORDER BY booking_count DESC;
```

### Step 6.3: Backup Strategy
```powershell
# Weekly backup script
$date = Get-Date -Format 'yyyyMMdd'
pg_dump -U postgres event_management > "backups/event_management_$date.sql"
```

**Checklist:**
- [ ] Cron logs appear daily
- [ ] Database queries run successfully
- [ ] Backup script scheduled (Windows Task Scheduler)

---

## Rollback Plan 🔄

### If Issues Occur:

**1. Restore Database:**
```powershell
psql -U postgres event_management < backup_YYYYMMDD_HHMMSS.sql
```

**2. Revert Code Changes:**
```powershell
git checkout HEAD -- Backend/routes/events.js
git checkout HEAD -- Backend/routes/booking.js
git checkout HEAD -- Backend/cron.js
git checkout HEAD -- Backend/server.js
git checkout HEAD -- Frontend/main.js
git checkout HEAD -- Frontend/style.css
```

**3. Remove Dependencies:**
```powershell
npm uninstall node-cron
```

---

## Final Verification ✅

### Complete System Test:

1. **Database:**
   - [ ] Migration applied successfully
   - [ ] All events have price values
   - [ ] Past events archived

2. **Backend:**
   - [ ] Server starts without errors
   - [ ] GET /api/events returns filtered, sorted data
   - [ ] POST /api/events accepts price field
   - [ ] POST /api/bookings validates past events
   - [ ] Cron job scheduled

3. **Frontend:**
   - [ ] Events display with prices
   - [ ] Events sorted by date
   - [ ] Past events hidden
   - [ ] Booking validation works

4. **Integration:**
   - [ ] End-to-end booking flow works
   - [ ] Error messages display correctly
   - [ ] No console errors in browser
   - [ ] No server errors in logs

---

## Support & Troubleshooting 🆘

### Common Issues:

**Issue:** Cron job not running
- **Solution:** Check `import './cron.js'` in server.js, restart server

**Issue:** Past events still showing
- **Solution:** Run manual archive SQL, verify date comparison logic

**Issue:** Price not displaying
- **Solution:** Clear browser cache, verify migration ran, check API response

**Issue:** Booking validation not working
- **Solution:** Check booking.js validation logic, verify event date format

**Issue:** Database connection error
- **Solution:** Verify PostgreSQL running, check credentials in db.js

---

## Success Criteria ✨

Your implementation is complete when:

- ✅ All events display prices on frontend
- ✅ Events sorted by date (earliest first)
- ✅ Past events automatically hidden from public view
- ✅ Users cannot book past or inactive events
- ✅ Cron job runs daily at 00:05
- ✅ All tests pass
- ✅ No errors in server logs
- ✅ No errors in browser console

---

## Estimated Time: 30-45 minutes

**Phase 1 (Database):** 5-10 min  
**Phase 2 (Backend):** 10-15 min  
**Phase 3 (Frontend):** 5 min  
**Phase 4 (Testing):** 10-15 min  
**Phase 5 (Production):** Optional  

---

**Need Help?** Check TESTING_GUIDE.md for detailed test scenarios and curl examples.
