import express from "express";
import pool from "../db.js";
import { verifyToken, verifyRole } from "../middleware/auth.js";

const router = express.Router();

// POST /api/bookings - Book tickets (Participant only)
router.post("/", verifyToken, verifyRole("Participant"), async (req, res) => {
  try {
    const { event_id, quantity } = req.body;
    const userId = req.user.user_id;
    
    if (!event_id) {
      return res.status(400).json({ success: false, message: "Event ID is required" });
    }

    // Verify event exists, is active, and is not past
    const eventCheck = await pool.query(
      `SELECT event_id, title, date, is_active 
       FROM events 
       WHERE event_id = $1`, 
      [event_id]
    );
    
    if (eventCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    const event = eventCheck.rows[0];
    
    // Check if event is inactive
    if (!event.is_active) {
      return res.status(422).json({ 
        success: false, 
        message: "This event is no longer available for booking" 
      });
    }
    
    // Check if event date is in the past
    const eventDate = new Date(event.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to compare dates only
    
    if (eventDate < today) {
      return res.status(422).json({ 
        success: false, 
        message: "This event date has passed and bookings are closed" 
      });
    }

    const tickets = quantity && quantity > 0 ? quantity : 1;

    const result = await pool.query(
      "INSERT INTO bookings (user_id, event_id, quantity) VALUES ($1, $2, $3) RETURNING *",
      [userId, event_id, tickets]
    );

    res.json({ success: true, booking: result.rows[0] });
  } catch (err) {
    console.error("Booking Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET /api/bookings/:user_id - Get bookings (Participant only)
router.get("/:user_id", verifyToken, verifyRole("Participant"), async (req, res) => {
  try {
    const requestedUserId = req.params.user_id;
    const authenticatedUserId = req.user.user_id;
    
    // Users can only access their own bookings
    if (parseInt(requestedUserId) !== authenticatedUserId) {
      return res.status(403).json({ success: false, message: "Access denied: You can only view your own bookings" });
    }

    const bookings = await pool.query(`
      SELECT b.booking_id, b.booked_at, b.quantity,
             e.event_id, e.title, e.date, e.venue, e.description, e.price,
             u.name as user_name
      FROM bookings b
      JOIN events e ON b.event_id = e.event_id
      JOIN users u ON b.user_id = u.user_id
      WHERE b.user_id = $1
      ORDER BY e.date ASC
    `, [requestedUserId]);

    res.json({ success: true, data: bookings.rows });
  } catch (err) {
    console.error("Error fetching bookings:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;


