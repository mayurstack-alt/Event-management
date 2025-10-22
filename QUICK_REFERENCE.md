# Quick Reference Card - Event Management Features

## 🚀 Quick Start (5 Minutes)

```powershell
# 1. Install dependencies
cd "c:\DBMS Project isFinal\Backend"
npm install

# 2. Apply database migration
psql -U postgres -d event_management
\i 'c:/DBMS Project isFinal/Backend/migrations/001_add_price_and_archival.sql'
\q

# 3. Start server
npm start

# 4. Test in browser
start "c:\DBMS Project isFinal\Frontend\index.html"
```

---

## 📋 What Changed (TL;DR)

| Feature | What It Does | Files Changed |
|---------|--------------|---------------|
| **Price Support** | Events now have prices (₹ 499.00 or Free) | `events.js`, `main.js`, `style.css` |
| **Date Sorting** | Events always sorted earliest → latest | `events.js`, `main.js` |
| **Past Event Archival** | Old events auto-hidden, can't be booked | `booking.js`, `cron.js`, `server.js` |

---

## 🗄️ Database Changes

```sql
-- Three new columns added to events table
ALTER TABLE events
  ADD COLUMN price NUMERIC(10,2) DEFAULT 0.00,
  ADD COLUMN is_active BOOLEAN DEFAULT TRUE,
  ADD COLUMN archived_at TIMESTAMP;
```

---

## 🔧 Backend Changes

### GET /api/events
**Before:** Returns all events  
**After:** Returns only active future events, sorted by date

### POST /api/events
**Before:** `{ title, date, venue, description }`  
**After:** `{ title, date, venue, description, price }`

### POST /api/bookings
**Before:** Basic validation  
**After:** Validates event is active and not past

### New: Cron Job
**File:** `Backend/cron.js`  
**Schedule:** Daily at 00:05  
**Action:** Marks past events as inactive

---

## 🎨 Frontend Changes

### Event Card Display
```
┌─────────────────────────┐
│ Music Concert           │
│ 📅 Nov 15, 2025        │
│ 📍 Mumbai              │
│ [₹ 499.00] ← NEW       │
│ [View Details]          │
└─────────────────────────┘
```

### New CSS Classes
- `.price-badge` - Gradient badge for price
- `.event-past` - Grayed out style for past events

---

## 🧪 Quick Tests

### Test 1: Verify Migration
```sql
SELECT event_id, title, price, is_active FROM events;
```
✅ Should show price and is_active columns

### Test 2: Get Events API
```powershell
curl http://localhost:3000/api/events
```
✅ Should return only active future events with prices

### Test 3: Frontend Display
Open `index.html` in browser  
✅ Should see price badges on event cards

### Test 4: Booking Validation
Try booking a past event  
✅ Should fail with "event date has passed" error

---

## 📁 New Files Created

```
Backend/
├── cron.js                              ← Archival job
└── migrations/
    ├── 001_add_price_and_archival.sql  ← Main migration
    └── one_time_archive.sql             ← Manual archive

Root/
├── FEATURES_SUMMARY.md                  ← Complete overview
├── IMPLEMENTATION_CHECKLIST.md          ← Step-by-step guide
├── TESTING_GUIDE.md                     ← Test scenarios
├── API_DOCUMENTATION.md                 ← API reference
└── QUICK_REFERENCE.md                   ← This file
```

---

## 🔑 Key SQL Queries

### Get Active Future Events
```sql
SELECT * FROM events 
WHERE is_active = true AND date >= CURRENT_DATE 
ORDER BY date ASC;
```

### Archive Past Events (Manual)
```sql
UPDATE events 
SET is_active = false, archived_at = NOW() 
WHERE date < CURRENT_DATE AND is_active = true;
```

### View Archived Events
```sql
SELECT * FROM events WHERE is_active = false;
```

### Restore Archived Event
```sql
UPDATE events 
SET is_active = true, archived_at = NULL 
WHERE event_id = 1;
```

---

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| Cron not running | Check `import './cron.js'` in server.js |
| Price not showing | Run migration, clear browser cache |
| Past events visible | Run manual archive SQL |
| Booking past events works | Check booking.js validation logic |

---

## 📞 Error Messages

| Code | Message | Meaning |
|------|---------|---------|
| 422 | "This event is no longer available for booking" | Event is inactive |
| 422 | "This event date has passed and bookings are closed" | Event is past |
| 404 | "Event not found" | Invalid event_id |
| 400 | "Event ID is required" | Missing event_id in request |

---

## 🎯 Testing Checklist

- [ ] Migration applied successfully
- [ ] Server starts without errors
- [ ] GET /api/events returns sorted events with prices
- [ ] POST /api/events accepts price field
- [ ] POST /api/bookings rejects past events
- [ ] Frontend displays price badges
- [ ] Events sorted by date on frontend
- [ ] Past events hidden from view
- [ ] Cron job scheduled (check logs)

---

## 📊 API Quick Reference

### Create Event with Price
```bash
POST /api/events
Headers: Authorization: Bearer TOKEN
Body: {
  "title": "Event Name",
  "date": "2025-12-31",
  "venue": "Location",
  "price": 499.99
}
```

### Book Event
```bash
POST /api/bookings
Headers: Authorization: Bearer TOKEN
Body: {
  "event_id": 1,
  "quantity": 2
}
```

### Get Events
```bash
GET /api/events
# No auth required
```

---

## ⏰ Cron Schedule Reference

```
'5 0 * * *'  = Daily at 00:05
'0 * * * *'  = Every hour
'0 0 * * 0'  = Every Sunday at midnight
'0 3 * * 1'  = Every Monday at 3 AM
```

---

## 🔒 Security Notes

✅ **Implemented:**
- Parameterized SQL queries
- JWT authentication
- Role-based access control
- Password hashing (bcrypt)

⚠️ **Recommended for Production:**
- HTTPS only
- Rate limiting
- CORS restrictions
- Environment variables for secrets

---

## 📈 Performance Tips

```sql
-- Add these indexes for better performance
CREATE INDEX idx_events_date_active ON events(date, is_active);
CREATE INDEX idx_events_active ON events(is_active) WHERE is_active = true;
```

---

## 🎓 Learning Resources

| Topic | File |
|-------|------|
| Complete feature overview | `FEATURES_SUMMARY.md` |
| Step-by-step implementation | `IMPLEMENTATION_CHECKLIST.md` |
| Testing scenarios | `TESTING_GUIDE.md` |
| API endpoints | `API_DOCUMENTATION.md` |
| Quick commands | `QUICK_REFERENCE.md` (this file) |

---

## 💡 Pro Tips

1. **Always backup database before migration:**
   ```powershell
   pg_dump -U postgres event_management > backup.sql
   ```

2. **Test in development first:**
   - Apply migration to test database
   - Run all tests
   - Then apply to production

3. **Monitor cron logs:**
   - Check server console at 00:05 daily
   - Verify archived events count

4. **Use environment variables:**
   - Never hardcode passwords
   - Use `.env` file for config

5. **Add database indexes:**
   - Improves query performance
   - Especially important as data grows

---

## 🚨 Emergency Rollback

```sql
-- Restore archived events
UPDATE events SET is_active = true, archived_at = NULL;

-- Remove new columns (if needed)
ALTER TABLE events DROP COLUMN price;
ALTER TABLE events DROP COLUMN is_active;
ALTER TABLE events DROP COLUMN archived_at;
```

```powershell
# Restore from backup
psql -U postgres event_management < backup.sql
```

---

## ✅ Deployment Checklist

- [ ] Backup production database
- [ ] Apply migration to production
- [ ] Deploy backend code
- [ ] Deploy frontend code
- [ ] Test all endpoints
- [ ] Verify cron job scheduled
- [ ] Monitor logs for 24 hours
- [ ] Add database indexes
- [ ] Update documentation

---

## 📞 Support

**Documentation:**
- `FEATURES_SUMMARY.md` - Complete overview
- `TESTING_GUIDE.md` - Test scenarios
- `API_DOCUMENTATION.md` - API reference

**Code Comments:**
- All files have inline comments
- Check migration SQL for detailed explanations

**Database Schema:**
- `Backend/events.sql` - Original schema
- `Backend/migrations/` - Schema changes

---

**Version:** 1.0.0  
**Last Updated:** 2025-10-19  
**Status:** ✅ Production Ready

---

## 🎉 You're All Set!

Your Event Management system now supports:
- ✅ Event pricing with beautiful UI
- ✅ Automatic date sorting
- ✅ Smart past event handling
- ✅ Robust booking validation
- ✅ Automated archival with cron

**Next Steps:**
1. Follow Quick Start above
2. Run tests from TESTING_GUIDE.md
3. Deploy to production
4. Monitor cron logs

**Questions?** Check the other documentation files!
