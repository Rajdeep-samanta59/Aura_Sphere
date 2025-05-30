import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import session from "express-session";
import passport from "passport";
import cors from "cors";

import connectDB from "./db/connect.js";
import authRoutes from "./routes/auth.js";
import userRouter from "./routes/userroute.js";
import goalRouter from "./routes/goals.js";
import addPt from "./routes/addpt.js";
import leaderboardRouter from "./routes/leaderboardroute.js";
import courseRouter from "./routes/courserouter.js";
import challengeRoutes from "./routes/challengeRoutes.js";
import gamificationRouter from "./routes/gamification.js";
import { errorHandler } from "./middleware/errorHandler.js";

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();

// Connect to MongoDB
const dbPromise = connectDB()
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: true,
    sameSite: 'none',
    maxAge: 24 * 60 * 60 * 1000,
  }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health-check
app.get("/api/health", async (req, res) => {
  await dbPromise;
  return res.json({ dbConnectionState: mongoose.connection.readyState });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/userinfo", userRouter);
app.use("/api/user/points", addPt);
app.use("/api/leaderboard", leaderboardRouter);
app.use("/api/goals", goalRouter);
app.use("/api/courses", courseRouter);
app.use("/api/gamification", challengeRoutes);
app.use("/api/gamification-full", gamificationRouter);

// Error handling & 404
app.use(errorHandler);
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

// Export for serverless
export default app;