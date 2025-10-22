


// import express from "express";
// import pool from "../db.js";

// const router = express.Router();

// // GET all events
// router.get("/", async (req, res) => {
//   try {
//     const result = await pool.query("SELECT * FROM events ORDER BY date ASC");
//     res.json({ success: true, data: result.rows });
//   } catch (err) {
//     console.error("Error fetching events:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// // POST new event
// router.post("/", async (req, res) => {
//   try {
//     const { title, date, venue, description } = req.body;
//     const result = await pool.query(
//       "INSERT INTO events (title, date, venue, description) VALUES ($1, $2, $3, $4) RETURNING *",
//       [title, date, venue, description]
//     );
//     res.json({ success: true, event: result.rows[0] });
//   } catch (err) {
//     console.error("Error creating event:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// // UPDATE event (PUT)
// router.put("/:id", async (req, res) => {
//   try {
//     const eventId = req.params.id;
//     const { title, date, venue, description } = req.body;
//     const result = await pool.query(
//       "UPDATE events SET title = $1, date = $2, venue = $3, description = $4 WHERE event_id = $5 RETURNING *",
//       [title, date, venue, description, eventId]
//     );
//     if (result.rows.length === 0) {
//       return res.status(404).json({ success: false, message: "Event not found" });
//     }
//     res.json({ success: true, event: result.rows[0] });
//   } catch (err) {
//     console.error("Error updating event:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// // DELETE event
// router.delete("/:id", async (req, res) => {
//   try {
//     const eventId = req.params.id;
//     const result = await pool.query("DELETE FROM events WHERE event_id = $1 RETURNING *", [eventId]);
//     if (result.rows.length === 0) {
//       return res.status(404).json({ success: false, message: "Event not found" });
//     }
//     res.json({ success: true });
//   } catch (err) {
//     console.error("Error deleting event:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// export default router;

import express from "express";
import pool from "../db.js";
import { requireRole } from "../middleware/rolecheck.js";

const router = express.Router();

// GET all events (public - no auth required)
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM events ORDER BY date ASC");
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST new event (Organizer only)
router.post("/", requireRole(["Organizer"]), async (req, res) => {
  try {
    const { title, date, venue, description } = req.body;
    const result = await pool.query(
      "INSERT INTO events (title, date, venue, description) VALUES ($1, $2, $3, $4) RETURNING *",
      [title, date, venue, description]
    );
    res.json({ success: true, event: result.rows[0] });
  } catch (err) {
    console.error("Error creating event:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// UPDATE event (Organizer only)
router.put("/:id", requireRole(["Organizer"]), async (req, res) => {
  try {
    const eventId = req.params.id;
    const { title, date, venue, description } = req.body;
    const result = await pool.query(
      "UPDATE events SET title = $1, date = $2, venue = $3, description = $4 WHERE event_id = $5 RETURNING *",
      [title, date, venue, description, eventId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }
    res.json({ success: true, event: result.rows[0] });
  } catch (err) {
    console.error("Error updating event:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// DELETE event (Organizer only)
router.delete("/:id", requireRole(["Organizer"]), async (req, res) => {
  try {
    const eventId = req.params.id;
    const result = await pool.query("DELETE FROM events WHERE event_id = $1 RETURNING *", [eventId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting event:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;


