import express from "express";
import pool from "../db.js";
import { verifyToken, verifyRole } from "../middleware/auth.js";

const router = express.Router();

// POST /api/payments - Create a new payment record
router.post("/", verifyToken, verifyRole("Participant"), async (req, res) => {
  try {
    const {
      booking_id,
      participant_name,
      event_id,
      event_title,
      tickets_count,
      total_amount,
      payment_method
    } = req.body;

    // Validation
    if (!event_id || !event_title || !tickets_count || !total_amount || !payment_method) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: event_id, event_title, tickets_count, total_amount, payment_method"
      });
    }

    if (tickets_count < 1) {
      return res.status(400).json({
        success: false,
        message: "Tickets count must be at least 1"
      });
    }

    if (total_amount < 0) {
      return res.status(400).json({
        success: false,
        message: "Total amount cannot be negative"
      });
    }

    // Verify event exists and is active
    const eventCheck = await pool.query(
      `SELECT event_id, title, price, is_active, date 
       FROM events 
       WHERE event_id = $1`,
      [event_id]
    );

    if (eventCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    const event = eventCheck.rows[0];

    // Check if event is active
    if (!event.is_active) {
      return res.status(422).json({
        success: false,
        message: "This event is no longer available for booking"
      });
    }

    // Check if event is not past
    const eventDate = new Date(event.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (eventDate < today) {
      return res.status(422).json({
        success: false,
        message: "This event date has passed and bookings are closed"
      });
    }

    // Verify price calculation
    const expectedAmount = parseFloat(event.price) * tickets_count;
    const receivedAmount = parseFloat(total_amount);

    if (Math.abs(expectedAmount - receivedAmount) > 0.01) {
      return res.status(400).json({
        success: false,
        message: `Price mismatch. Expected: ₹${expectedAmount.toFixed(2)}, Received: ₹${receivedAmount.toFixed(2)}`
      });
    }

    // Generate unique transaction ID
    const transaction_id = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Insert payment record
    const paymentResult = await pool.query(
      `INSERT INTO payments (
        booking_id, 
        participant_name, 
        event_id, 
        event_title, 
        tickets_count, 
        total_amount, 
        payment_method, 
        payment_status, 
        transaction_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'Paid', $8) 
      RETURNING *`,
      [
        booking_id || null,
        participant_name,
        event_id,
        event_title,
        tickets_count,
        total_amount,
        payment_method,
        transaction_id
      ]
    );

    const payment = paymentResult.rows[0];

    // If booking_id was provided, update the booking with payment_id
    if (booking_id) {
      await pool.query(
        `UPDATE bookings SET payment_id = $1 WHERE booking_id = $2`,
        [payment.payment_id, booking_id]
      );
    }

    res.status(201).json({
      success: true,
      message: "Payment successful! Your booking is confirmed.",
      payment: payment
    });

  } catch (err) {
    console.error("Payment Error:", err);
    res.status(500).json({
      success: false,
      message: "Server error while processing payment"
    });
  }
});

// GET /api/payments/user/:user_id - Get all payments for a participant
router.get("/user/:user_id", verifyToken, verifyRole("Participant"), async (req, res) => {
  try {
    const requestedUserId = req.params.user_id;
    const authenticatedUserId = req.user.user_id;

    // Users can only access their own payments
    if (parseInt(requestedUserId) !== authenticatedUserId) {
      return res.status(403).json({
        success: false,
        message: "Access denied: You can only view your own payments"
      });
    }

    // Get payments by joining with bookings to get user info
    const payments = await pool.query(
      `SELECT 
        p.payment_id,
        p.booking_id,
        p.participant_name,
        p.event_id,
        p.event_title,
        p.tickets_count,
        p.total_amount,
        p.payment_method,
        p.payment_status,
        p.transaction_id,
        p.payment_date,
        e.date as event_date,
        e.venue as event_venue,
        e.description as event_description
      FROM payments p
      LEFT JOIN bookings b ON p.booking_id = b.booking_id
      LEFT JOIN events e ON p.event_id = e.event_id
      WHERE b.user_id = $1 OR p.participant_name = (
        SELECT name FROM users WHERE user_id = $1
      )
      ORDER BY p.payment_date DESC`,
      [requestedUserId]
    );

    res.json({
      success: true,
      data: payments.rows
    });

  } catch (err) {
    console.error("Error fetching payments:", err);
    res.status(500).json({
      success: false,
      message: "Server error while fetching payments"
    });
  }
});

// GET /api/payments/:payment_id - Get a specific payment by ID
router.get("/:payment_id", verifyToken, async (req, res) => {
  try {
    const paymentId = req.params.payment_id;

    const payment = await pool.query(
      `SELECT 
        p.*,
        e.date as event_date,
        e.venue as event_venue,
        e.description as event_description
      FROM payments p
      LEFT JOIN events e ON p.event_id = e.event_id
      WHERE p.payment_id = $1`,
      [paymentId]
    );

    if (payment.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    res.json({
      success: true,
      data: payment.rows[0]
    });

  } catch (err) {
    console.error("Error fetching payment:", err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

// GET /api/payments - Get all payments (Admin/Organizer only - optional)
router.get("/", verifyToken, async (req, res) => {
  try {
    // Optional: Add role check for admin/organizer
    const payments = await pool.query(
      `SELECT 
        p.*,
        e.date as event_date,
        e.venue as event_venue
      FROM payments p
      LEFT JOIN events e ON p.event_id = e.event_id
      ORDER BY p.payment_date DESC
      LIMIT 100`
    );

    res.json({
      success: true,
      data: payments.rows
    });

  } catch (err) {
    console.error("Error fetching payments:", err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

export default router;
