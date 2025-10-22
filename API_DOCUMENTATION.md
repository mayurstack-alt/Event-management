# API Documentation - Event Management System

## Base URL
```
http://localhost:3000
```

---

## 📋 Events API

### GET /api/events
Retrieve all active future events, sorted by date ascending.

**Authentication:** Optional (public endpoint)

**Query Filters Applied:**
- `is_active = true`
- `date >= CURRENT_DATE`
- Sorted by `date ASC`

**Request:**
```bash
curl http://localhost:3000/api/events
```

**Response (200 OK):**
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
      "created_at": "2025-10-19T14:30:00.000Z"
    },
    {
      "event_id": 2,
      "title": "Tech Expo",
      "date": "2025-12-01",
      "venue": "Bangalore",
      "description": "Explore cutting-edge technologies and startups.",
      "price": "250.00",
      "is_active": true,
      "created_at": "2025-10-19T14:30:00.000Z"
    }
  ]
}
```

**Notes:**
- Past events are automatically excluded
- Inactive events (`is_active = false`) are excluded
- Price is returned as string in format "XXX.XX"

---

### POST /api/events
Create a new event (Organizer only).

**Authentication:** Required (JWT token, Organizer role)

**Request:**
```bash
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "New Year Party",
    "date": "2025-12-31",
    "venue": "Mumbai",
    "description": "Celebrate 2026!",
    "price": 999.99
  }'
```

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | Yes | Event title (max 150 chars) |
| date | string | Yes | Event date (YYYY-MM-DD format) |
| venue | string | Yes | Event venue (max 150 chars) |
| description | string | No | Event description |
| price | number | No | Ticket price (default: 0.00) |

**Response (200 OK):**
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
    "created_at": "2025-10-19T14:35:00.000Z"
  }
}
```

**Error Responses:**

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Title, date, and venue are required"
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "message": "Access denied. Organizer role required."
}
```

---

### PUT /api/events/:id
Update an existing event (Organizer only).

**Authentication:** Required (JWT token, Organizer role)

**Request:**
```bash
curl -X PUT http://localhost:3000/api/events/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Music Concert - Updated",
    "date": "2025-11-20",
    "venue": "Navi Mumbai Arena",
    "description": "Updated description",
    "price": 599.00
  }'
```

**Request Body:** Same as POST /api/events

**Response (200 OK):**
```json
{
  "success": true,
  "event": {
    "event_id": 1,
    "title": "Music Concert - Updated",
    "date": "2025-11-20",
    "venue": "Navi Mumbai Arena",
    "description": "Updated description",
    "price": "599.00",
    "is_active": true,
    "created_at": "2025-10-19T14:30:00.000Z"
  }
}
```

**Error Responses:**

**404 Not Found:**
```json
{
  "success": false,
  "message": "Event not found"
}
```

---

### DELETE /api/events/:id
Delete an event (Organizer only).

**Authentication:** Required (JWT token, Organizer role)

**Request:**
```bash
curl -X DELETE http://localhost:3000/api/events/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "success": true
}
```

**Error Responses:**

**404 Not Found:**
```json
{
  "success": false,
  "message": "Event not found"
}
```

---

## 🎫 Bookings API

### POST /api/bookings
Book tickets for an event (Participant only).

**Authentication:** Required (JWT token, Participant role)

**Validation Rules:**
- Event must exist
- Event must be active (`is_active = true`)
- Event date must be in the future (`date >= today`)

**Request:**
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "event_id": 1,
    "quantity": 2
  }'
```

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| event_id | integer | Yes | ID of the event to book |
| quantity | integer | No | Number of tickets (default: 1) |

**Response (200 OK):**
```json
{
  "success": true,
  "booking": {
    "booking_id": 1,
    "user_id": 2,
    "event_id": 1,
    "quantity": 2,
    "booked_at": "2025-10-19T14:40:00.000Z"
  }
}
```

**Error Responses:**

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Event ID is required"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Event not found"
}
```

**422 Unprocessable Entity (Inactive Event):**
```json
{
  "success": false,
  "message": "This event is no longer available for booking"
}
```

**422 Unprocessable Entity (Past Event):**
```json
{
  "success": false,
  "message": "This event date has passed and bookings are closed"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "message": "Access denied. Participant role required."
}
```

---

### GET /api/bookings/:user_id
Retrieve all bookings for a specific user (Participant only).

**Authentication:** Required (JWT token, Participant role)

**Authorization:** Users can only view their own bookings.

**Request:**
```bash
curl http://localhost:3000/api/bookings/2 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "booking_id": 1,
      "booked_at": "2025-10-19T14:40:00.000Z",
      "quantity": 2,
      "event_id": 1,
      "title": "Music Concert",
      "date": "2025-11-15",
      "venue": "Navi Mumbai",
      "description": "An amazing night of live music.",
      "price": "499.00",
      "user_name": "John Doe"
    }
  ]
}
```

**Error Responses:**

**403 Forbidden:**
```json
{
  "success": false,
  "message": "Access denied: You can only view your own bookings"
}
```

---

## 🔐 Authentication API

### POST /api/auth/register
Register a new user.

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "Participant"
  }'
```

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | User's full name |
| email | string | Yes | User's email (unique) |
| password | string | Yes | User's password (min 6 chars) |
| role | string | Yes | "Organizer" or "Participant" |

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "user_id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Participant"
  }
}
```

---

### POST /api/auth/login
Login and receive JWT token.

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123",
    "role": "Participant"
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "user_id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Participant"
  }
}
```

**Error Responses:**

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

---

## 🔧 Admin Endpoints (Optional)

### POST /api/admin/archive-past-events
Manually trigger archival of past events.

**Note:** This endpoint needs to be added to `server.js` if you want manual triggering.

**Implementation:**
```javascript
// Add to server.js
import { archivePastEventsNow } from './cron.js';

app.post('/api/admin/archive-past-events', async (req, res) => {
  try {
    const archived = await archivePastEventsNow();
    res.json({ success: true, archived, count: archived.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
```

**Request:**
```bash
curl -X POST http://localhost:3000/api/admin/archive-past-events
```

**Response (200 OK):**
```json
{
  "success": true,
  "count": 3,
  "archived": [
    {
      "event_id": 5,
      "title": "Past Event 1",
      "date": "2024-01-01"
    },
    {
      "event_id": 8,
      "title": "Past Event 2",
      "date": "2024-06-15"
    }
  ]
}
```

---

## 📊 Response Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, DELETE, POST |
| 201 | Created | Successful resource creation |
| 400 | Bad Request | Missing required fields |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 422 | Unprocessable Entity | Business logic validation failed |
| 500 | Internal Server Error | Server-side error |

---

## 🔑 Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Token Payload:**
```json
{
  "user_id": 1,
  "email": "john@example.com",
  "role": "Participant",
  "iat": 1697721600,
  "exp": 1697808000
}
```

**Token Expiration:** 24 hours (configurable in auth middleware)

---

## 🌐 CORS Configuration

The API accepts requests from any origin (configured in `server.js`):

```javascript
app.use(cors());
```

For production, restrict to specific origins:

```javascript
app.use(cors({
  origin: 'https://yourdomain.com',
  credentials: true
}));
```

---

## 📝 Data Types & Formats

### Date Format
- **Input:** `YYYY-MM-DD` (e.g., "2025-12-31")
- **Output:** ISO 8601 (e.g., "2025-12-31T00:00:00.000Z")

### Price Format
- **Input:** Number (e.g., 499.99)
- **Output:** String with 2 decimals (e.g., "499.99")
- **Database:** NUMERIC(10,2)

### Boolean Format
- **Input/Output:** `true` or `false`
- **Database:** BOOLEAN

---

## 🧪 Testing with cURL

### Complete Workflow Example

**1. Register as Participant:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123","role":"Participant"}'
```

**2. Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","role":"Participant"}'
```

**3. Get Events:**
```bash
curl http://localhost:3000/api/events
```

**4. Book Event:**
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"event_id":1,"quantity":2}'
```

**5. View Bookings:**
```bash
curl http://localhost:3000/api/bookings/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🐛 Error Handling

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description here"
}
```

**Common Error Messages:**

| Message | Cause | Solution |
|---------|-------|----------|
| "Access denied. No token provided." | Missing Authorization header | Include JWT token |
| "Invalid token" | Expired or malformed token | Login again |
| "Access denied. Organizer role required." | Wrong user role | Login as Organizer |
| "Event not found" | Invalid event_id | Check event exists |
| "This event date has passed..." | Booking past event | Choose future event |

---

## 📈 Rate Limiting (Recommended for Production)

Consider adding rate limiting:

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

## 🔒 Security Best Practices

1. **Never expose JWT secret** in client-side code
2. **Use HTTPS** in production
3. **Validate all inputs** on server-side
4. **Use parameterized queries** (already implemented)
5. **Hash passwords** with bcrypt (already implemented)
6. **Set token expiration** (24 hours recommended)
7. **Implement rate limiting** for production
8. **Use environment variables** for sensitive data

---

## 📚 Additional Resources

- **Testing Guide:** See `TESTING_GUIDE.md`
- **Implementation Checklist:** See `IMPLEMENTATION_CHECKLIST.md`
- **Database Schema:** See `Backend/events.sql`
- **Migration Scripts:** See `Backend/migrations/`

---

**Last Updated:** 2025-10-19  
**API Version:** 1.0.0
