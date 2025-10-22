// Middleware to check if user has the required role
// For now, we'll pass user_id in request body for simplicity
// In production, use JWT or session-based authentication

import pool from "../db.js";

export function requireRole(allowedRoles) {
  return async (req, res, next) => {
    try {
      // Get user_id from multiple possible sources
      const userId = req.body.user_id || req.params.user_id || req.query.user_id;
      
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized: No user ID provided" });
      }

      const result = await pool.query("SELECT role FROM users WHERE user_id = $1", [userId]);
      
      if (result.rows.length === 0) {
        return res.status(401).json({ success: false, message: "Unauthorized: User not found" });
      }

      const userRole = result.rows[0].role;

      if (allowedRoles.includes(userRole)) {
        req.userRole = userRole;
        next();
      } else {
        res.status(403).json({ success: false, message: `Access denied: ${allowedRoles.join(" or ")} role required` });
      }
    } catch (err) {
      console.error("Role check error:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  };
}
