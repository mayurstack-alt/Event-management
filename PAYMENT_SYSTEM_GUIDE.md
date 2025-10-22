# Payment System & Ticket Pricing - Complete Implementation Guide

## 🎯 Features Implemented

### Feature 1: Ticket Pricing for Events
- ✅ Organizers can set ticket prices when creating events
- ✅ Price field with validation (no negative values)
- ✅ Price displayed on all event cards with ₹ symbol
- ✅ Support for free events (₹ 0.00)
- ✅ Edit existing event prices

### Feature 2: Simulated Payment System
- ✅ Payment modal with ticket quantity selection
- ✅ Multiple payment methods (UPI, Card, Wallet, Net Banking)
- ✅ Real-time price calculation
- ✅ Transaction ID generation (TXN + timestamp)
- ✅ Payment records stored in database
- ✅ Beautiful ticket-style display of bookings
- ✅ Complete transaction details

---

## 📋 Implementation Steps

### Step 1: Apply Database Migration

```powershell
# Connect to PostgreSQL
psql -U postgres -d event_management

# Run the migration
\i 'c:/DBMS Project isFinal/Backend/migrations/002_add_payments_system.sql'

# Verify tables
\d events
\d payments

# Exit
\q
```

**Expected Output:**
- `events` table now has `price` column
- New `payments` table created with all fields
- Existing events updated with sample prices

---

### Step 2: Update Backend Server

The backend is already updated with:
- ✅ `routes/payments.js` - New payment routes
- ✅ `server.js` - Payments route registered
- ✅ `routes/events.js` - Already supports price field (from previous feature)

**Verify server starts:**
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

---

### Step 3: Update Frontend Files

#### Option A: Replace Existing Participant Files (Recommended)

```powershell
# Backup existing files
cd "c:\DBMS Project isFinal\Frontend"
Copy-Item participant.html participant.html.backup
Copy-Item participant.js participant.js.backup

# Replace with new payment-enabled files
Copy-Item participant-new.html participant.html -Force
Copy-Item participant-payment.js participant.js -Force
```

#### Option B: Use New Files Separately

Simply open `participant-new.html` instead of `participant.html` for testing.

---

## 🧪 Testing Guide

### Test 1: Organizer - Create Event with Price

1. **Login as Organizer:**
   - Open `organizer-login.html`
   - Login with organizer credentials

2. **Create New Event:**
   - Fill in event details:
     - Title: "Test Concert"
     - Date: (select future date)
     - Venue: "Test Venue"
     - Description: "Test event"
     - **Ticket Price: 299.00**
   - Click "Add Event"

3. **Verify:**
   - ✅ Event appears in "Your Events" section
   - ✅ Price displayed as "₹ 299.00"
   - ✅ Can edit price in edit form

**Expected Result:**
```
Test Concert
Date: [selected date]
Venue: Test Venue
Price: ₹ 299.00
[Edit] [Delete]
```

---

### Test 2: Organizer - Edit Event Price

1. **Click "Edit" on any event**
2. **Change price** (e.g., from 299.00 to 399.00)
3. **Click "Save"**
4. **Verify:** Price updated to ₹ 399.00

---

### Test 3: Participant - View Events with Prices

1. **Login as Participant:**
   - Open `participant-login.html` (or `participant-new.html`)
   - Login with participant credentials

2. **Browse Events:**
   - All events show price badges
   - Free events display "Free"
   - Paid events display "₹ XXX.XX"

**Expected Display:**
```
┌──────────────────────────┐
│ Test Concert             │
│ 📅 Date: [date]         │
│ 📍 Venue: Test Venue    │
│ [₹ 299.00]  ← Badge     │
│ [Book Tickets]           │
└──────────────────────────┘
```

---

### Test 4: Participant - Complete Payment Flow

1. **Click "Book Tickets" on any event**

2. **Payment Modal Opens:**
   - Event name displayed
   - Number of tickets input (default: 1)
   - Payment method dropdown
   - Price summary shows:
     - Price per ticket: ₹ 299.00
     - Number of tickets: 1
     - **Total Amount: ₹ 299.00**

3. **Change Ticket Quantity:**
   - Enter 3 tickets
   - Total updates to ₹ 897.00

4. **Select Payment Method:**
   - Choose "UPI" (or any method)

5. **Click "Confirm Payment":**
   - Confirmation dialog appears
   - Click "OK"

6. **Success Message:**
```
✅ Payment Successful!

Transaction ID: TXN1729445678123
Event: Test Concert
Tickets: 3
Amount Paid: ₹ 897.00
Payment Method: UPI

Your booking is confirmed!
```

7. **Verify "My Event Tickets" Section:**
   - Beautiful ticket card appears
   - Shows all details:
     - Event title
     - Transaction ID
     - Event date & venue
     - Participant name
     - Payment method
     - Number of tickets
     - Total amount
     - Booking date/time

---

### Test 5: Payment Validation

**Test 5.1: Negative Tickets**
- Try entering 0 or negative tickets
- **Expected:** Error message "Please enter a valid number of tickets (minimum 1)"

**Test 5.2: Past Event Booking**
- Try booking a past event
- **Expected:** "Book Tickets" button disabled with "Event Passed" label

**Test 5.3: Inactive Event**
- Event marked as inactive
- **Expected:** Cannot book, returns 422 error

**Test 5.4: Price Mismatch**
- Backend validates price calculation
- **Expected:** If client sends wrong amount, returns 400 error

---

## 🔍 Database Verification

### Check Payments Table

```sql
-- View all payments
SELECT 
  payment_id,
  participant_name,
  event_title,
  tickets_count,
  total_amount,
  payment_method,
  transaction_id,
  payment_status,
  payment_date
FROM payments
ORDER BY payment_date DESC;
```

**Expected Output:**
```
 payment_id | participant_name | event_title  | tickets_count | total_amount | payment_method | transaction_id    | payment_status | payment_date
------------+------------------+--------------+---------------+--------------+----------------+-------------------+----------------+--------------
          1 | John Doe         | Test Concert |             3 |       897.00 | UPI            | TXN1729445678123  | Paid           | 2025-10-20...
```

### Check Bookings Linked to Payments

```sql
-- View bookings with payment info
SELECT 
  b.booking_id,
  b.user_id,
  b.event_id,
  b.quantity,
  b.payment_id,
  p.transaction_id,
  p.total_amount
FROM bookings b
LEFT JOIN payments p ON b.payment_id = p.payment_id
ORDER BY b.booked_at DESC;
```

### Check Events with Prices

```sql
-- View all events with prices
SELECT 
  event_id,
  title,
  date,
  venue,
  price,
  is_active
FROM events
WHERE is_active = true
ORDER BY date ASC;
```

---

## 📊 API Testing with cURL

### Test 1: Create Event with Price

```powershell
# Login as organizer first to get token
$loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"organizer@test.com","password":"password123","role":"Organizer"}'
$token = $loginResponse.token

# Create event with price
$headers = @{ Authorization = "Bearer $token" }
$body = @{
    title = "API Test Event"
    date = "2025-12-25"
    venue = "API Venue"
    description = "Created via API"
    price = 599.99
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/events" -Method Post -Headers $headers -ContentType "application/json" -Body $body
```

**Expected Response:**
```json
{
  "success": true,
  "event": {
    "event_id": 12,
    "title": "API Test Event",
    "date": "2025-12-25",
    "venue": "API Venue",
    "description": "Created via API",
    "price": "599.99",
    "is_active": true,
    "created_at": "2025-10-20T..."
  }
}
```

### Test 2: Create Payment

```powershell
# Login as participant
$loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"participant@test.com","password":"password123","role":"Participant"}'
$token = $loginResponse.token

# First create booking
$headers = @{ Authorization = "Bearer $token" }
$bookingBody = @{
    event_id = 1
    quantity = 2
} | ConvertTo-Json

$bookingResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/bookings" -Method Post -Headers $headers -ContentType "application/json" -Body $bookingBody

# Then create payment
$paymentBody = @{
    booking_id = $bookingResponse.booking.booking_id
    participant_name = "Test User"
    event_id = 1
    event_title = "Music Concert"
    tickets_count = 2
    total_amount = 998.00
    payment_method = "UPI"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/payments" -Method Post -Headers $headers -ContentType "application/json" -Body $paymentBody
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Payment successful! Your booking is confirmed.",
  "payment": {
    "payment_id": 1,
    "booking_id": 1,
    "participant_name": "Test User",
    "event_id": 1,
    "event_title": "Music Concert",
    "tickets_count": 2,
    "total_amount": "998.00",
    "payment_method": "UPI",
    "payment_status": "Paid",
    "transaction_id": "TXN1729445678456",
    "payment_date": "2025-10-20T..."
  }
}
```

### Test 3: Get User Payments

```powershell
$headers = @{ Authorization = "Bearer $token" }
Invoke-RestMethod -Uri "http://localhost:3000/api/payments/user/1" -Method Get -Headers $headers
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "payment_id": 1,
      "participant_name": "Test User",
      "event_title": "Music Concert",
      "tickets_count": 2,
      "total_amount": "998.00",
      "payment_method": "UPI",
      "transaction_id": "TXN1729445678456",
      "event_date": "2025-11-15",
      "event_venue": "Navi Mumbai"
    }
  ]
}
```

---

## 🎨 UI/UX Features

### Payment Modal
- **Modern Design:** Gradient background, smooth animations
- **Real-time Calculation:** Total updates as you change quantity
- **Clear Summary:** Shows price breakdown
- **Multiple Payment Methods:** UPI, Card, Wallet, Net Banking
- **Validation:** Prevents invalid inputs

### Ticket Cards
- **Beautiful Gradient:** Purple/blue gradient background
- **Ticket-like Design:** Rounded corners, shadow effects
- **Complete Information:**
  - Transaction ID (top-right badge)
  - Event details (date, venue)
  - Participant name
  - Payment method
  - Ticket count
  - Total amount
  - Booking timestamp
- **Hover Effect:** Lifts up on hover
- **Responsive:** Works on mobile devices

---

## 🔒 Security Features

### Backend Validation
1. **Authentication Required:** All payment endpoints require JWT token
2. **Role Verification:** Only participants can make payments
3. **Price Validation:** Backend verifies price matches event price
4. **Event Validation:** Checks event exists, is active, and not past
5. **SQL Injection Prevention:** Parameterized queries
6. **Transaction ID Uniqueness:** Unique constraint on transaction_id

### Frontend Validation
1. **Minimum Tickets:** Must be at least 1
2. **Confirmation Dialog:** User must confirm before payment
3. **Disabled During Processing:** Prevents double-submission
4. **Past Event Check:** Disables booking for past events

---

## 🐛 Troubleshooting

### Issue 1: Price not showing on events
**Solution:**
1. Verify migration ran: `\d events` in psql
2. Check events have prices: `SELECT title, price FROM events;`
3. Clear browser cache
4. Check browser console for errors

### Issue 2: Payment modal not opening
**Solution:**
1. Check browser console for JavaScript errors
2. Verify `participant-payment.js` is loaded
3. Check if using correct HTML file (`participant-new.html`)

### Issue 3: Payment fails with "Price mismatch"
**Solution:**
1. Backend validates price calculation
2. Ensure frontend sends correct total_amount
3. Check event price in database matches frontend display

### Issue 4: Tickets not showing in "My Tickets"
**Solution:**
1. Verify payment was successful (check payments table)
2. Check API endpoint: `GET /api/payments/user/:user_id`
3. Ensure user_id matches logged-in user
4. Check browser console for errors

### Issue 5: Cannot create event with price
**Solution:**
1. Verify price input field exists in organizer.html
2. Check organizer.js sends price in request body
3. Verify backend events.js accepts price parameter
4. Check for validation errors (negative price)

---

## 📝 File Checklist

### Backend Files
- ✅ `Backend/migrations/002_add_payments_system.sql` - Database migration
- ✅ `Backend/routes/payments.js` - Payment API routes
- ✅ `Backend/server.js` - Updated with payments route
- ✅ `Backend/routes/events.js` - Already supports price (from previous feature)

### Frontend Files
- ✅ `Frontend/organizer.html` - Updated with price input
- ✅ `Frontend/organizer.js` - Updated to handle price
- ✅ `Frontend/participant-new.html` - New payment-enabled participant page
- ✅ `Frontend/participant-payment.js` - Complete payment system logic

### Documentation
- ✅ `PAYMENT_SYSTEM_GUIDE.md` - This file

---

## 🚀 Deployment Checklist

### Development
- [ ] Apply database migration
- [ ] Restart backend server
- [ ] Test organizer price input
- [ ] Test participant payment flow
- [ ] Verify tickets display correctly
- [ ] Test all payment methods
- [ ] Check database records

### Production
- [ ] Backup database before migration
- [ ] Apply migration to production database
- [ ] Deploy updated backend code
- [ ] Deploy updated frontend files
- [ ] Test end-to-end flow
- [ ] Monitor error logs
- [ ] Verify payment records

---

## 💡 Usage Tips

### For Organizers
1. **Set Realistic Prices:** Consider your audience
2. **Use 0 for Free Events:** System handles free events gracefully
3. **Edit Prices Anytime:** Can update prices for future events
4. **Price Display:** Prices automatically formatted with ₹ symbol

### For Participants
1. **Check Price Before Booking:** Clearly displayed on event cards
2. **Select Quantity Carefully:** Total calculated automatically
3. **Choose Payment Method:** Select preferred method from dropdown
4. **Save Transaction ID:** Displayed in success message and ticket
5. **View All Tickets:** Check "My Event Tickets" section

---

## 📊 Database Schema

### Payments Table Structure
```sql
payments (
    payment_id SERIAL PRIMARY KEY,
    booking_id INT REFERENCES bookings(booking_id),
    participant_name VARCHAR(100) NOT NULL,
    event_id INT REFERENCES events(event_id),
    event_title VARCHAR(200) NOT NULL,
    tickets_count INT NOT NULL DEFAULT 1,
    total_amount NUMERIC(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'Paid',
    transaction_id VARCHAR(100) UNIQUE NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

### Events Table (Updated)
```sql
events (
    event_id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    date DATE NOT NULL,
    venue VARCHAR(150) NOT NULL,
    description TEXT,
    price NUMERIC(10,2) DEFAULT 0.00,  -- NEW
    is_active BOOLEAN DEFAULT TRUE,
    archived_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

---

## 🎯 Success Criteria

Your implementation is complete when:

- ✅ Organizers can set prices when creating events
- ✅ Prices display on all event cards with ₹ symbol
- ✅ Payment modal opens when clicking "Book Tickets"
- ✅ Total amount calculates correctly based on quantity
- ✅ Payment creates record in database
- ✅ Transaction ID generated and stored
- ✅ Tickets display in beautiful card format
- ✅ All transaction details visible
- ✅ Cannot book past or inactive events
- ✅ No errors in browser console or server logs

---

## 📞 Support

**Common Questions:**

**Q: Can I use real payment gateways?**
A: This is a simulated system. To integrate real payments (Razorpay, Stripe), you'd need to:
1. Sign up for payment gateway account
2. Install their SDK
3. Replace simulated payment with actual API calls
4. Handle webhooks for payment confirmation

**Q: Can users cancel bookings?**
A: Not implemented yet. To add cancellation:
1. Add `cancelled` status to payments
2. Create DELETE endpoint for bookings
3. Update UI with cancel button
4. Handle refund logic

**Q: How to export payment reports?**
A: Add an admin endpoint:
```javascript
router.get("/api/payments/export", async (req, res) => {
  // Query payments with filters
  // Export as CSV or PDF
});
```

---

**Implementation Time:** 15-20 minutes  
**Testing Time:** 10-15 minutes  
**Total Time:** 25-35 minutes

---

**Version:** 1.0.0  
**Last Updated:** 2025-10-20  
**Status:** ✅ Production Ready
