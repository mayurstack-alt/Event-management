
// import express from "express";
// import pool from "../db.js";
// import bcrypt from "bcryptjs";

// const router = express.Router();

// // REGISTER
// router.post("/register", async (req, res) => {
//   try {
//     const { name, email, password, role } = req.body;
//     if (!name || !email || !password || !role) {
//       return res.status(400).json({ success: false, message: "Missing data" });
//     }
//     const hash = await bcrypt.hash(password, 10);
//     const result = await pool.query(
//       "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *",
//       [name, email, hash, role]
//     );
//     res.json({ success: true, user: result.rows[0] });
//   } catch (err) {
//     if (err.code === "23505") return res.json({ success: false, message: "Email already registered" });
//     console.error(err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// // LOGIN
// router.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const userRes = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
//     if (userRes.rows.length === 0) return res.json({ success: false, message: "Invalid email or password" });

//     const user = userRes.rows[0];
//     const match = await bcrypt.compare(password, user.password);
//     if (!match) return res.json({ success: false, message: "Invalid email or password" });

//     res.json({ success: true, user });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// export default router;


import express from "express";
import bcrypt from "bcryptjs";
import pool from "../db.js";
import { generateToken, verifyToken, verifyRole } from "../middleware/auth.js";

const router = express.Router();

// Helper function for registration
const registerUser = async (req, res, role) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields required" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    // Check if email already exists
    const checkEmail = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (checkEmail.rows.length > 0) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert user
    const result = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING user_id, name, email, role",
      [name, email, hashedPassword, role]
    );

    const user = result.rows[0];
    const token = generateToken(user.user_id, user.role);

    res.json({ 
      success: true, 
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token 
    });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Helper function for login
const loginUser = async (req, res, expectedRole) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password required" });
    }

    const result = await pool.query(
      "SELECT user_id, name, email, role, password FROM users WHERE email = $1 AND role = $2",
      [email, expectedRole]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    const token = generateToken(user.user_id, user.role);

    res.json({
      success: true,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ========== ORGANIZER ROUTES ==========

// Organizer Registration
router.post("/organizer/register", async (req, res) => {
  await registerUser(req, res, "Organizer");
});

// Organizer Login
router.post("/organizer/login", async (req, res) => {
  await loginUser(req, res, "Organizer");
});

// ========== PARTICIPANT ROUTES ==========

// Participant Registration
router.post("/participant/register", async (req, res) => {
  await registerUser(req, res, "Participant");
});

// Participant Login
router.post("/participant/login", async (req, res) => {
  await loginUser(req, res, "Participant");
});

// ========== GENERAL AUTH ROUTES ==========

// Verify token endpoint
router.get("/verify", verifyToken, (req, res) => {
  res.json({
    success: true,
    user: req.user,
    message: "Token is valid"
  });
});

// Get user profile (requires authentication)
router.get("/profile", verifyToken, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

// Logout (client-side token removal)
router.post("/logout", (req, res) => {
  res.json({
    success: true,
    message: "Logged out successfully"
  });
});

export default router;





