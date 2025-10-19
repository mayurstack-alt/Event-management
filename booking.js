import express from "express";
import pool from "../db.js";
import { requireRole } from "../middleware/rolecheck.js";

const router = express.Router();

// POST /api/bookings - Book tickets (Participant only)
router.post("/", async (req, res) => {
  try {
    const { user_id, event_id, quantity } = req.body;
    
    if (!user_id || !event_id) {
      return res.status(400).json({ success: false, message: "Missing data" });
    }

    // Check if user is a Participant
    const userCheck = await pool.query("SELECT role FROM users WHERE user_id = $1", [user_id]);
    if (userCheck.rows.length === 0 || userCheck.rows[0].role !== "Participant") {
      return res.status(403).json({ success: false, message: "Only participants can book events" });
    }

    const tickets = quantity && quantity > 0 ? quantity : 1;

    const result = await pool.query(
      "INSERT INTO bookings (user_id, event_id, quantity) VALUES ($1, $2, $3) RETURNING *",
      [user_id, event_id, tickets]
    );

    res.json({ success: true, booking: result.rows[0] });
  } catch (err) {
    console.error("Booking Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET /api/bookings/:user_id - Get bookings (Participant only)
router.get("/:user_id", async (req, res) => {
  try {
    const userId = req.params.user_id;
    
    // Check if user is a Participant
    const userCheck = await pool.query("SELECT role FROM users WHERE user_id = $1", [userId]);
    if (userCheck.rows.length === 0 || userCheck.rows[0].role !== "Participant") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const bookings = await pool.query(`
      SELECT b.booking_id, b.booked_at, b.quantity,
             e.event_id, e.title, e.date, e.venue, e.description,
             u.name as user_name
      FROM bookings b
      JOIN events e ON b.event_id = e.event_id
      JOIN users u ON b.user_id = u.user_id
      WHERE b.user_id = $1
      ORDER BY e.date ASC
    `, [userId]);

    res.json({ success: true, data: bookings.rows });
  } catch (err) {
    console.error("Error fetching bookings:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;


