import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  user: "postgres",        // 🔹 your PostgreSQL username
  host: "localhost",
  database: "event_management",
  password: "mayur",   // 🔹 replace with your password
  port: 5432,
});

// Optionally verify connection at startup
pool
  .connect()
  .then((client) => {
    client.release();
    console.log("✅ Connected to PostgreSQL");
  })
  .catch((err) => console.error("❌ DB connection error:", err));

export default pool;
