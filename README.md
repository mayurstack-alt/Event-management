# EventHub - Professional Event Management System

A full-stack event management platform built with Node.js, PostgreSQL, and vanilla HTML/CSS/JavaScript, featuring professional role-based authentication and access control.

## ✨ New Features (October 2025)

### 1. Event Pricing Support
- Events now support decimal prices (₹ 0.00 to ₹ 99,999,999.99)
- Beautiful gradient price badges on event cards
- Free events display "Free" instead of price
- Price included in booking details
- Organizers can set and edit prices

### 2. Simulated Payment System 💳
- **Complete payment flow** with modal interface
- **Multiple payment methods:** UPI, Card, Wallet, Net Banking
- **Real-time price calculation** based on ticket quantity
- **Transaction ID generation** (TXN + timestamp)
- **Payment records** stored in database
- **Beautiful ticket cards** displaying all transaction details
- **Participant name, event details, payment method** tracked
- **Offline/local simulation** - No external payment gateway required

### 3. Automatic Date Sorting
- Events always displayed in chronological order (earliest first)
- Server-side sorting with client-side fallback
- Consistent ordering across all views

### 4. Past Event Handling
- Automatic archival of past events (daily at 00:05)
- Past events hidden from public view
- Booking validation prevents booking past/inactive events
- Soft-delete strategy with audit trail (`archived_at` timestamp)

**📚 Complete Documentation:**
- [`PAYMENT_SYSTEM_GUIDE.md`](PAYMENT_SYSTEM_GUIDE.md) - **NEW!** Payment system implementation guide
- [`QUICK_START_PAYMENT.md`](QUICK_START_PAYMENT.md) - **NEW!** 5-minute payment setup
- [`IMPLEMENTATION_SUMMARY.md`](IMPLEMENTATION_SUMMARY.md) - **NEW!** Complete implementation summary
- [`FEATURES_SUMMARY.md`](FEATURES_SUMMARY.md) - Complete feature overview
- [`IMPLEMENTATION_CHECKLIST.md`](IMPLEMENTATION_CHECKLIST.md) - Step-by-step setup guide
- [`TESTING_GUIDE.md`](TESTING_GUIDE.md) - Comprehensive testing scenarios
- [`API_DOCUMENTATION.md`](API_DOCUMENTATION.md) - Complete API reference
- [`QUICK_REFERENCE.md`](QUICK_REFERENCE.md) - Quick commands & troubleshooting
- [`ARCHITECTURE_DIAGRAM.txt`](ARCHITECTURE_DIAGRAM.txt) - System architecture

---

## 🚀 Features

### Authentication System
- **Role-based Access Control**: Separate login/registration flows for Organizers and Participants
- **JWT Authentication**: Secure token-based authentication with role verification
- **Password Hashing**: Bcrypt encryption for secure password storage
- **Access Control**: Professional access denial messages and role restrictions

### User Roles
- **Organizers**: Create, manage, and promote events with professional tools
- **Participants**: Discover, book, and enjoy amazing events

### Core Functionality
- Event creation and management (Organizers only)
- Event browsing and booking (Participants)
- Real-time booking status tracking
- Professional UI with modern design

## 📁 Project Structure

```
DBMS Project isFinal/
├── Backend/
│   ├── db.js                    # Database connection
│   ├── server.js                # Express server setup
│   ├── events.sql               # Database schema and sample data
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication middleware
│   │   └── rolecheck.js         # Legacy role checking (deprecated)
│   └── routes/
│       ├── auth.js              # Authentication routes (JWT-based)
│       ├── events.js            # Event management routes
│       └── booking.js           # Booking routes
└── Frontend/
    ├── index.html               # Landing page with role selection
    ├── organizer-login.html     # Organizer login page
    ├── organizer-register.html  # Organizer registration page
    ├── organizer-login.js       # Organizer login logic
    ├── organizer-register.js    # Organizer registration logic
    ├── participant-login.html   # Participant login page
    ├── participant-register.html# Participant registration page
    ├── participant-login.js     # Participant login logic
    ├── participant-register.js  # Participant registration logic
    ├── organizer.html           # Organizer dashboard
    ├── organizer.js             # Organizer dashboard logic
    ├── participant.html         # Participant dashboard
    ├── participant.js           # Participant dashboard logic
    ├── main.js                  # Landing page logic
    └── style.css                # Professional styling
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL database
- Git

### 1. Database Setup

1. **Install PostgreSQL** and create a database named `event_management`

2. **Update database credentials** in `Backend/db.js`:
   ```javascript
   const pool = new Pool({
     user: "your_username",
     host: "localhost",
     database: "event_management",
     password: "your_password",
     port: 5432,
   });
   ```

3. **Run the database schema** from `Backend/events.sql`:
   ```sql
   -- Execute the SQL commands in events.sql to create tables and sample data
   ```

### 2. Backend Setup

1. **Navigate to Backend directory**:
   ```bash
   cd Backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the server**:
   ```bash
   npm start
   ```
   
   The server will run on `http://localhost:3000`

### 3. Frontend Setup

1. **Navigate to Frontend directory**:
   ```bash
   cd Frontend
   ```

2. **Open the application**:
   - Simply open `index.html` in your web browser
   - Or use a local server like Live Server in VS Code

## 🔐 Authentication Flow

### New User Journey

1. **Landing Page**: User selects their role (Organizer or Participant)
2. **Registration**: User creates account with role-specific form
3. **Login**: User logs in with credentials
4. **Dashboard Access**: Redirected to appropriate dashboard based on role

### API Endpoints

#### Authentication Routes
- `POST /api/auth/organizer/register` - Organizer registration
- `POST /api/auth/organizer/login` - Organizer login
- `POST /api/auth/participant/register` - Participant registration
- `POST /api/auth/participant/login` - Participant login
- `GET /api/auth/verify` - Verify JWT token
- `GET /api/auth/profile` - Get user profile

#### Event Routes
- `GET /api/events` - Get all events (public)
- `POST /api/events` - Create event (Organizer only)
- `PUT /api/events/:id` - Update event (Organizer only)
- `DELETE /api/events/:id` - Delete event (Organizer only)

#### Booking Routes
- `POST /api/bookings` - Book tickets (Participant only)
- `GET /api/bookings/:user_id` - Get user bookings (Participant only)

## 🎨 UI/UX Features

### Professional Design
- Modern gradient backgrounds
- Glass-morphism effects
- Smooth animations and transitions
- Responsive design for all devices
- Professional color scheme

### User Experience
- Clear role selection on landing page
- Intuitive navigation flows
- Access denied messages with helpful guidance
- Real-time form validation
- Loading states and feedback

## 🔒 Security Features

### Authentication Security
- JWT tokens with expiration (24 hours)
- Password hashing with bcrypt (12 salt rounds)
- Role-based access control
- Token verification on protected routes

### Access Control
- Organizers cannot access participant features
- Participants cannot access organizer features
- Proper error messages for unauthorized access
- Session management with token storage

## 🧪 Testing the System

### Test Scenarios

1. **Organizer Flow**:
   - Register as organizer → Login → Create events → Manage events

2. **Participant Flow**:
   - Register as participant → Login → Browse events → Book tickets

3. **Access Control**:
   - Try accessing organizer pages as participant (should show access denied)
   - Try accessing participant pages as organizer (should show access denied)

4. **Authentication**:
   - Try accessing protected pages without login (should redirect to login)
   - Test token expiration and refresh

### Sample Test Data

The system comes with sample events in the database. You can:
- Create new events as an organizer
- Book tickets as a participant
- Test different user scenarios

## 🚀 Deployment Considerations

### Environment Variables
Create a `.env` file in the Backend directory:
```env
JWT_SECRET=your-super-secret-jwt-key-here
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=event_management
```

### Production Checklist
- [ ] Change JWT secret to a secure random string
- [ ] Use environment variables for database credentials
- [ ] Set up HTTPS in production
- [ ] Configure CORS for production domain
- [ ] Set up proper logging
- [ ] Configure rate limiting

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection Error**:
   - Check PostgreSQL is running
   - Verify database credentials in `db.js`
   - Ensure database `event_management` exists

2. **JWT Token Issues**:
   - Check if JWT_SECRET is set
   - Verify token is being sent in Authorization header
   - Check token expiration

3. **CORS Issues**:
   - Ensure CORS is enabled in server.js
   - Check if frontend and backend are on same domain/port

4. **Authentication Failures**:
   - Verify user exists in database
   - Check password hashing is working
   - Ensure role is correctly set

## 📝 API Documentation

### Request/Response Format

All API responses follow this format:
```json
{
  "success": true/false,
  "message": "Description of result",
  "data": { /* Response data */ },
  "token": "JWT token (for auth endpoints)"
}
```

### Error Handling

The system provides detailed error messages for:
- Validation errors
- Authentication failures
- Authorization issues
- Server errors

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🎯 Future Enhancements

- Email verification for registration
- Password reset functionality
- Event categories and filtering
- Payment integration for bookings
- Event analytics dashboard
- Mobile app development
- Real-time notifications
- Event sharing and social features

---

**Built with ❤️ for professional event management**
