// import express from "express";
// import pool from "../db.js";

// const router = express.Router();

// // REGISTER
// router.post("/register", async (req, res) => {
//   try {
//     const { name, email, password, role } = req.body;

//     if (!name || !email || !password || !role) {
//       return res.status(400).json({ success: false, message: "All fields required" });
//     }

//     const checkEmail = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
//     if (checkEmail.rows.length > 0) {
//       return res.status(400).json({ success: false, message: "Email already exists" });
//     }

//     const result = await pool.query(
//       "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING user_id, name, email, role",
//       [name, email, password, role]
//     );

//     res.json({ success: true, user: result.rows[0] });
//   } catch (err) {
//     console.error("Register Error:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// // LOGIN
// router.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const result = await pool.query(
//       "SELECT user_id, name, role, password FROM users WHERE email = $1",
//       [email]
//     );

//     if (result.rows.length === 0) {
//       return res.status(400).json({ success: false, message: "Invalid email or password" });
//     }

//     const user = result.rows[0];
//     if (user.password !== password) {
//       return res.status(400).json({ success: false, message: "Invalid email or password" });
//     }

//     res.json({
//       success: true,
//       user: {
//         user_id: user.user_id,
//         name: user.name,
//         role: user.role
//       }
//     });
//   } catch (err) {
//     console.error("Login Error:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// export default router;



import express from "express";
import pool from "../db.js";
import bcrypt from "bcryptjs";

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: "Missing data" });
    }
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, email, hash, role]
    );
    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    if (err.code === "23505") return res.json({ success: false, message: "Email already registered" });
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const userRes = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userRes.rows.length === 0) return res.json({ success: false, message: "Invalid email or password" });

    const user = userRes.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.json({ success: false, message: "Invalid email or password" });

    res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;




