

import express from "express";
import dotenv from "dotenv";
import connectDB from "./db/connect.js";
import session from "express-session";
import passport from "passport";
import cookieParser from 'cookie-parser';
import cors from "cors";
import mongoose from "mongoose";
import auth from "./routes/auth.js";
import "./passport.js";
import { errorHandler } from "./middleware/errorHandler.js";


// delete down 

const dbPromise = connectDB()
  .then(() => console.log("MongoDB initial connection OK"))
  .catch(err => console.error("MongoDB initial connection ERROR:", err));



// Routes

import userRouter from "./routes/userroute.js";
import goalRouter from "./routes/goals.js";
import addPt from "./routes/addpt.js";
import lead from "./routes/leaderboardroute.js";
import courseRouter from "./routes/courserouter.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";

   import gamificationRouter from "./routes/gamification.js";

import challengeRoutes from "./routes/challengeRoutes.js";

dotenv.config({ path: "./.env" });

const app = express();


// 2. Middleware
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// Allowlist for CORS - include localhost for development
const allowedOrigins = new Set([
  "https://aura-sphere-4n42.vercel.app",
  "https://aura-sphere-4n42.vercel.app/",
  FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:3000",
]);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. curl, mobile apps)
      if (!origin) return callback(null, true);
      if (allowedOrigins.has(origin)) return callback(null, true);
      // For development convenience, allow if NODE_ENV is not production
      if (process.env.NODE_ENV !== "production") return callback(null, true);
      callback(new Error("Not allowed by CORS"));
    },
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    allowedHeaders: "Content-Type,Authorization",
  })
);

// Handle preflight requests
app.options("*", cors());


app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
  // Set secure only in production (requires HTTPS)
  secure: process.env.NODE_ENV === "production",
  // relax sameSite for development, tighten in production
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);




app.use(passport.initialize());
app.use(passport.session());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Log incoming API requests for debugging
app.use('/api', (req, res, next) => {
  console.log('[api] incoming request', req.method, req.originalUrl, 'authHeader=', !!req.headers.authorization);
  next();
});

// 3. Health check route to avoid 404 on root
app.get("/", (req, res) => {
  res.status(200).json({ message: "AuraSphere Backend API is running 😁" });
});

// 4. API Routes delete immidiately 


app.get("/api/health", async (req, res) => {
  try {
    // Wait here until the initial DB connection promise settles
    await dbPromise;
    const state = mongoose.connection.readyState; 
    return res.json({ dbConnectionState: state });
  } catch (err) {
    console.error("Health-check DB error:", err);
    return res.status(500).json({ error: err.message });
  }
});


app.use("/api/auth", auth);   
app.use("/api/userinfo", userRouter);
app.use("/api/leaderboard", lead);
app.use("/api/user/points", addPt);

app.use("/api/goals", goalRouter);
// Ensure legacy/edge-case path is handled directly: toggle goal status
import protect from "./middleware/auth.js";
import { User } from "./models/user.model.js";

app.put('/api/goals/user/:userId/goals/:goalId', protect, async (req, res) => {
  const { userId, goalId } = req.params;
  try {
    console.log('[index] direct toggle handler called', userId, goalId);
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const goal = user.academicGoals.id(goalId);
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    goal.completed = !goal.completed;
    await user.save();
    res.json({ message: 'Goal status updated', goal });
  } catch (err) {
    console.error('Direct toggle error', err);
    res.status(500).json({ message: 'Server error' });
  }
});
app.use("/api/courses", courseRouter);
app.use("/api/gamification", challengeRoutes);
app.use("/api/assignments", assignmentRoutes);

app.use(errorHandler);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});


// Start server when this file is run directly
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

export default app;
