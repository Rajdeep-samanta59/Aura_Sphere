/*
  Updated index.js for Vercel serverless deployment:
  - Removed app.listen() and process.exit calls
  - Top-level async IIFE to connect to DB without exit
  - Exported Express app instead of listening
  - Moved errorHandler after all routes
  - Removed duplicate /api/gamification mount
*/

import express from "express";
import dotenv from "dotenv";
import connectDB from "./db/connect.js";
import session from "express-session";
import passport from "passport";
import cors from "cors";

import "./passport.js";
import { errorHandler } from "./middleware/errorHandler.js";

// Routes
import auth from "./routes/auth.js";
import userRouter from "./routes/userroute.js";
import goalRouter from "./routes/goals.js";
import addPt from "./routes/addpt.js";
import lead from "./routes/leaderboardroute.js";
import courseRouter from "./routes/courserouter.js";
import gamificationRouter from "./routes/gamificiation.js";
import challengeRoutes from "./routes/challengeRoutes.js";

dotenv.config({ path: "./.env" });

const app = express();

// 1. Connect to DB at cold start (no process.exit or app.listen needed)
(async () => {
  try {
    await connectDB();
    console.log("MongoDB connected");
  } catch (err) {
    console.error("DB connection error:", err);
    // Do not exit; function will handle errors per request
  }
})();

// 2. Middleware
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
app.use(
  cors({
    origin: "https://aura-sphere.vercel.app", // ✅ Frontend domain
    credentials: true, // ✅ Allow cookies across domains
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: true, // ✅ required on HTTPS
      sameSite: "none", // ✅ needed for cross-site cookies
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);




app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 3. Health check route to avoid 404 on root
app.get("/", (req, res) => {
  res.status(200).json({ message: "AuraSphere Backend API is running ✅" });
});

// 4. API Routes delete immidiately 
import mongoose from "mongoose";

app.get("/api/health", async (req, res) => {
  try {
    // If you have a mongoose connection object, you can check readyState:
    const state = mongoose.connection.readyState; 
    // 1 = connected
    res.json({ dbConnectionState: state });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}); 
app.use("/api/auth", auth);   //addded now /api 
app.use("/userinfo", userRouter);
app.use("/api/user", addPt);
app.use("/userr", lead);
app.use("/user", goalRouter);
app.use("/courses", courseRouter);
app.use("/api/gamification", challengeRoutes);
app.use("/gamification", gamificationRouter);

// 5. Error handler (moved after routes)
app.use(errorHandler);

// 6. 404 fallback
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// 7. Export the app (no app.listen)
export default app;
