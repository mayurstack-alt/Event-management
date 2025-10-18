// import express from "express";
// import pool from "../db.js";

// const router = express.Router();

// // BOOK TICKET
// router.post("/", async (req, res) => {
//   try {
//     const { user_id, event_id } = req.body;

//     if (!user_id || !event_id) {
//       return res.status(400).json({ success: false, message: "Missing data" });
//     }

//     const userCheck = await pool.query("SELECT role FROM users WHERE user_id = $1", [user_id]);
//     if (userCheck.rows.length === 0 || userCheck.rows[0].role !== "Participant") {
//       return res.json({ success: false, message: "Only participants can book events" });
//     }

//     const result = await pool.query(
//       "INSERT INTO bookings (user_id, event_id) VALUES ($1, $2) RETURNING *",
//       [user_id, event_id]
//     );

//     res.json({ success: true, booking: result.rows[0] });
//   } catch (err) {
//     if (err.code === "23505") {
//       return res.json({ success: false, message: "Already booked" });
//     }
//     console.error("Booking Error:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// export default router;


// import express from "express";
// import pool from "../db.js";

// const router = express.Router();

// // BOOK TICKET
// router.post("/", async (req, res) => {
//   try {
//     const { user_id, event_id } = req.body;

//     if (!user_id || !event_id) {
//       return res.status(400).json({ success: false, message: "Missing data" });
//     }

//     const userCheck = await pool.query("SELECT role FROM users WHERE user_id = $1", [user_id]);
//     if (userCheck.rows.length === 0 || userCheck.rows[0].role !== "Participant") {
//       return res.json({ success: false, message: "Only participants can book events" });
//     }

//     const result = await pool.query(
//       "INSERT INTO bookings (user_id, event_id) VALUES ($1, $2) RETURNING *",
//       [user_id, event_id]
//     );

//     res.json({ success: true, booking: result.rows[0] });
//   } catch (err) {
//     if (err.code === "23505") {
//       return res.json({ success: false, message: "Already booked" });
//     }
//     console.error("Booking Error:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// // GET bookings for a participant
// router.get("/:user_id", async (req, res) => {
//   try {
//     const userId = req.params.user_id;

//     const userCheck = await pool.query("SELECT role FROM users WHERE user_id = $1", [userId]);
//     if (userCheck.rows.length === 0 || userCheck.rows[0].role !== "Participant") {
//       return res.status(400).json({ success: false, message: "Invalid participant" });
//     }

//     const bookings = await pool.query(`
//       SELECT b.booking_id, b.booked_at, e.event_id, e.title, e.date, e.venue, e.description
//       FROM bookings b
//       JOIN events e ON b.event_id = e.event_id
//       WHERE b.user_id = $1
//       ORDER BY e.date ASC
//     `, [userId]);

//     res.json({ success: true, data: bookings.rows });
//   } catch (err) {
//     console.error("Error fetching bookings:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// export default router;

// import express from "express";
// import pool from "../db.js";

// const router = express.Router();

// // POST /api/bookings - Book tickets with quantity
// router.post("/", async (req, res) => {
//   try {
//     const { user_id, event_id, quantity } = req.body;
//     if (!user_id || !event_id) {
//       return res.status(400).json({ success: false, message: "Missing data" });
//     }
//     const tickets = quantity && quantity > 0 ? quantity : 1;

//     const userCheck = await pool.query("SELECT role FROM users WHERE user_id = $1", [user_id]);
//     if (userCheck.rows.length === 0 || userCheck.rows[0].role !== "Participant") {
//       return res.json({ success: false, message: "Only participants can book events" });
//     }

//     const result = await pool.query(
//       "INSERT INTO bookings (user_id, event_id, quantity) VALUES ($1, $2, $3) RETURNING *",
//       [user_id, event_id, tickets]
//     );

//     res.json({ success: true, booking: result.rows[0] });
//   } catch (err) {
//     console.error("Booking Error:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// // GET /api/bookings/:user_id - Get bookings with user names
// router.get("/:user_id", async (req, res) => {
//   try {
//     const userId = req.params.user_id;
//     const bookings = await pool.query(`
//       SELECT b.booking_id, b.booked_at, b.quantity,
//              e.event_id, e.title, e.date, e.venue, e.description,
//              u.name as user_name
//       FROM bookings b
//       JOIN events e ON b.event_id = e.event_id
//       JOIN users u ON b.user_id = u.user_id
//       WHERE b.user_id = $1
//       ORDER BY e.date ASC
//     `, [userId]);

//     res.json({ success: true, data: bookings.rows });
//   } catch (err) {
//     console.error("Error fetching bookings:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// export default router;

import express from "express";
import pool from "../db.js";

const router = express.Router();

// BOOK TICKET (supports multiple bookings)
router.post("/", async (req, res) => {
  try {
    const { user_id, event_id } = req.body;
    if (!user_id || !event_id) return res.status(400).json({ success: false, message: "Missing data" });

    // Check if user exists and is a participant
    const userCheck = await pool.query("SELECT role FROM users WHERE user_id = $1", [user_id]);
    if (userCheck.rows.length === 0 || userCheck.rows[0].role !== "Participant") {
      return res.json({ success: false, message: "Only participants can book events" });
    }

    const result = await pool.query(
      "INSERT INTO bookings (user_id, event_id) VALUES ($1, $2) RETURNING *",
      [user_id, event_id]
    );

    res.json({ success: true, booking: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET all bookings for a participant
router.get("/:user_id", async (req, res) => {
  try {
    const userId = req.params.user_id;
    const userCheck = await pool.query("SELECT role FROM users WHERE user_id = $1", [userId]);
    if (userCheck.rows.length === 0 || userCheck.rows[0].role !== "Participant") {
      return res.status(400).json({ success: false, message: "Invalid participant" });
    }

    const bookings = await pool.query(`
      SELECT b.booking_id, b.booked_at, e.event_id, e.title, e.date, e.venue, e.description
      FROM bookings b
      JOIN events e ON b.event_id = e.event_id
      WHERE b.user_id = $1
      ORDER BY e.date ASC
    `, [userId]);

    res.json({ success: true, data: bookings.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;

