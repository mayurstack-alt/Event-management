# Testing Guide - Event Management Features

## Overview
This guide covers testing for three new features:
1. **Price support** for events
2. **Automatic date sorting** (ascending)
3. **Automatic archival** of past events

---

## Prerequisites

### 1. Install Dependencies
```powershell
cd "c:\DBMS Project isFinal\Backend"
npm install
```

### 2. Apply Database Migration
```powershell
# Connect to PostgreSQL
psql -U postgres -d event_management

# Run migration
\i 'c:/DBMS Project isFinal/Backend/migrations/001_add_price_and_archival.sql'

# Verify columns added
\d events
```

Expected output should show: `price`, `is_active`, `archived_at` columns.

---

## Test Scenarios

### Test 1: Database Migration Verification

**SQL Query:**
```sql
SELECT event_id, title, date, price, is_active, archived_at 
FROM events 
ORDER BY date ASC;
```

**Expected Result:**
- All events have `price` values (numeric)
- All future events have `is_active = true`
- Past events (date < today) have `is_active = false` and `archived_at` timestamp

---

### Test 2: GET /api/events - Filtered & Sorted

**cURL Command:**
```powershell
curl http://localhost:3000/api/events
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "event_id": 1,
      "title": "Music Concert",
      "date": "2025-11-15",
      "venue": "Navi Mumbai",
      "description": "An amazing night of live music.",
      "price": "499.00",
      "is_active": true,
      "created_at": "2025-10-19T..."
    },
    ...
  ]
}
```

**Validation Checklist:**
- ✅ Only events with `is_active = true` are returned
- ✅ Only events with `date >= today` are returned
- ✅ Events are sorted by `date` in ascending order (earliest first)
- ✅ `price` field is present in each event

---

### Test 3: POST /api/events - Create Event with Price

**Prerequisites:** Login as Organizer and get JWT token.

**Login Request:**
```powershell
curl -X POST http://localhost:3000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"organizer@example.com\",\"password\":\"password123\",\"role\":\"Organizer\"}'
```

**Create Event Request:**
```powershell
# Replace YOUR_JWT_TOKEN with actual token from login response
curl -X POST http://localhost:3000/api/events `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer YOUR_JWT_TOKEN" `
  -d '{\"title\":\"New Year Party\",\"date\":\"2025-12-31\",\"venue\":\"Mumbai\",\"description\":\"Celebrate 2026!\",\"price\":999.99}'
```

**Expected Response:**
```json
{
  "success": true,
  "event": {
    "event_id": 11,
    "title": "New Year Party",
    "date": "2025-12-31",
    "venue": "Mumbai",
    "description": "Celebrate 2026!",
    "price": "999.99",
    "is_active": true,
    "created_at": "2025-10-19T..."
  }
}
```

**Validation:**
- ✅ Event created with correct price
- ✅ `is_active` defaults to `true`
- ✅ Event appears in GET /api/events

---

### Test 4: POST /api/bookings - Book Future Event (Success)

**Prerequisites:** Login as Participant.

**Login Request:**
```powershell
curl -X POST http://localhost:3000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"participant@example.com\",\"password\":\"password123\",\"role\":\"Participant\"}'
```

**Booking Request:**
```powershell
# Replace YOUR_JWT_TOKEN and event_id with actual values
curl -X POST http://localhost:3000/api/bookings `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer YOUR_JWT_TOKEN" `
  -d '{\"event_id\":1,\"quantity\":2}'
```

**Expected Response:**
```json
{
  "success": true,
  "booking": {
    "booking_id": 1,
    "user_id": 2,
    "event_id": 1,
    "quantity": 2,
    "booked_at": "2025-10-19T..."
  }
}
```

---

### Test 5: POST /api/bookings - Book Past Event (Failure)

**Setup:** Create a past event manually:
```sql
INSERT INTO events (title, date, venue, description, price, is_active)
VALUES ('Past Event', '2024-01-01', 'Test Venue', 'This is past', 100.00, true);
```

**Booking Request:**
```powershell
curl -X POST http://localhost:3000/api/bookings `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer YOUR_JWT_TOKEN" `
  -d '{\"event_id\":PAST_EVENT_ID,\"quantity\":1}'
```

**Expected Response (422 Error):**
```json
{
  "success": false,
  "message": "This event date has passed and bookings are closed"
}
```

---

### Test 6: Cron Job - Manual Archive Trigger

**Option A: Run SQL Directly**
```sql
UPDATE events 
SET is_active = false, archived_at = NOW() 
WHERE date < CURRENT_DATE AND is_active = true
RETURNING event_id, title, date;
```

**Option B: Trigger via Node.js (if you add an endpoint)**
Create a test endpoint in `server.js`:
```javascript
import { archivePastEventsNow } from './cron.js';

app.post('/api/admin/archive-past-events', async (req, res) => {
  try {
    const archived = await archivePastEventsNow();
    res.json({ success: true, archived });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
```

Then call:
```powershell
curl -X POST http://localhost:3000/api/admin/archive-past-events
```

**Validation:**
- ✅ Past events have `is_active = false`
- ✅ Past events have `archived_at` timestamp
- ✅ Past events no longer appear in GET /api/events

---

### Test 7: Frontend Display

**Steps:**
1. Start backend: `npm start` (in Backend folder)
2. Open `Frontend/index.html` in browser
3. Verify event cards show:
   - ✅ Event title, date, venue
   - ✅ **Price badge** (e.g., "₹ 499.00" or "Free")
   - ✅ Events sorted by date (earliest first)
   - ✅ No past events displayed
4. Click "View Details" on an event
5. Verify modal shows:
   - ✅ Price field
   - ✅ "Book Event" button enabled for future events

---

## Rollback Instructions

### Revert Database Changes
```sql
-- Restore archived events
UPDATE events SET is_active = true, archived_at = NULL WHERE is_active = false;

-- Remove new columns (if needed)
ALTER TABLE events DROP COLUMN IF EXISTS price;
ALTER TABLE events DROP COLUMN IF EXISTS is_active;
ALTER TABLE events DROP COLUMN IF EXISTS archived_at;
```

### Revert Code Changes
```powershell
git checkout HEAD -- Backend/routes/events.js
git checkout HEAD -- Backend/routes/booking.js
git checkout HEAD -- Frontend/main.js
git checkout HEAD -- Frontend/style.css
```

---

## Timezone Considerations

**Current Implementation:**
- Uses `CURRENT_DATE` in PostgreSQL (server timezone)
- JavaScript date comparisons use client timezone

**Recommendation for Production:**
- Store event dates as `TIMESTAMP WITH TIME ZONE`
- Use `CURRENT_DATE AT TIME ZONE 'UTC'` for consistent comparisons
- Display times converted to user's local timezone on frontend

**Migration for Timezone Support:**
```sql
ALTER TABLE events ALTER COLUMN date TYPE TIMESTAMP WITH TIME ZONE 
USING date::timestamp AT TIME ZONE 'UTC';
```

---

## Automated Testing Script

Create `test.ps1` in Backend folder:

```powershell
# Test script for Event Management features
Write-Host "🧪 Running Event Management Tests..." -ForegroundColor Cyan

# Test 1: GET events
Write-Host "`n📋 Test 1: GET /api/events" -ForegroundColor Yellow
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/events" -Method Get
Write-Host "✅ Found $($response.data.Count) active events" -ForegroundColor Green

# Test 2: Verify sorting
$dates = $response.data | ForEach-Object { [DateTime]$_.date }
$sorted = $dates | Sort-Object
if (($dates -join ',') -eq ($sorted -join ',')) {
    Write-Host "✅ Events are sorted by date (ascending)" -ForegroundColor Green
} else {
    Write-Host "❌ Events are NOT sorted correctly" -ForegroundColor Red
}

# Test 3: Verify price field
$hasPrice = $response.data | Where-Object { $null -ne $_.price }
if ($hasPrice.Count -eq $response.data.Count) {
    Write-Host "✅ All events have price field" -ForegroundColor Green
} else {
    Write-Host "❌ Some events missing price field" -ForegroundColor Red
}

Write-Host "`n✨ Tests completed!" -ForegroundColor Cyan
```

Run with: `.\test.ps1`

---

## Common Issues & Solutions

### Issue 1: Cron job not running
**Solution:** Ensure `import './cron.js';` is in `server.js` and server is restarted.

### Issue 2: Past events still showing
**Solution:** Run manual archive SQL or restart server to trigger cron.

### Issue 3: Price not displaying
**Solution:** Clear browser cache and verify migration ran successfully.

### Issue 4: Booking past events succeeds
**Solution:** Check backend validation in `booking.js` and ensure date comparison logic is correct.

---

## Performance Considerations

**Database Indexes (Recommended):**
```sql
CREATE INDEX idx_events_date_active ON events(date, is_active);
CREATE INDEX idx_events_active ON events(is_active) WHERE is_active = true;
```

**Benefits:**
- Faster filtering on `is_active` and `date`
- Improved query performance for GET /api/events

---

## Next Steps

1. ✅ Apply database migration
2. ✅ Install `node-cron` dependency
3. ✅ Restart backend server
4. ✅ Test all scenarios above
5. ✅ Monitor cron job logs daily
6. ✅ Add database indexes for production
7. ✅ Consider timezone standardization for global users
