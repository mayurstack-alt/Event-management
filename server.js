// import express from "express";
// import cors from "cors";
// import eventsRouter from "./routes/events.js";

// const app = express();
// const PORT = 3000;

// app.use(cors());
// app.use(express.json());

// // Base route
// app.get("/", (req, res) => {
//   res.send("Event Management Backend is running ✅");
// });

// // Events API
// app.use("/api/events", eventsRouter);

// // For future: user routes
// // import usersRouter from "./routes/users.js";
// // app.use("/api/users", usersRouter);

// app.listen(PORT, () => {
//   console.log(`🚀 Server running on http://localhost:${PORT}`);
// });

// import express from "express";
// import cors from "cors";
// import eventsRouter from "./routes/events.js";
// import authRouter from "./routes/auth.js";
// import bookingRouter from "./routes/booking.js";

// const app = express();
// const PORT = 3000;

// // Middleware
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Base route
// app.get("/", (req, res) => {
//   res.send("Event Management Backend is running ✅");
// });

// // Routes
// app.use("/api/events", eventsRouter);       // Events CRUD
// app.use("/api/auth", authRouter);           // Register & Login
// app.use("/api/bookings", bookingRouter);    // Book tickets

// // Start server
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on http://localhost:${PORT}`);
// });


import express from "express";
import cors from "cors";
import eventsRouter from "./routes/events.js";
import authRouter from "./routes/auth.js";
import bookingsRouter from "./routes/booking.js";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Base route
app.get("/", (req, res) => {
  res.send("Event Management Backend is running ✅");
});

// Routes
app.use("/api/events", eventsRouter);
app.use("/api/auth", authRouter);
app.use("/api/bookings", bookingsRouter);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});


