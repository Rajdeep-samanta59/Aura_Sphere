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
import cookieParser from 'cookie-parser';
import cors from "cors";
import mongoose from "mongoose";
import auth from "./routes/auth.js";
import "./passport.js";
import { errorHandler } from "./middleware/errorHandler.js";


// delete down 

// import connectDB from "./db/connect.js";
// Kick off the initial connection and capture the promise
const dbPromise = connectDB()
  .then(() => console.log("MongoDB initial connection OK"))
  .catch(err => console.error("MongoDB initial connection ERROR:", err));



// Routes

import userRouter from "./routes/userroute.js";
import goalRouter from "./routes/goals.js";
import addPt from "./routes/addpt.js";
import lead from "./routes/leaderboardroute.js";
import courseRouter from "./routes/courserouter.js";
// import gamificationRouter from "./routes/gamification.js";
   import gamificationRouter from "./routes/gamification.js";

import challengeRoutes from "./routes/challengeRoutes.js";

dotenv.config({ path: "./.env" });

const app = express();

// 1. Connect to DB at cold start (no process.exit or app.listen needed)


// (async () => {
//   try {
//     await connectDB();
//     console.log("MongoDB connected");
//   } catch (err) {
//     console.error("DB connection error:", err);
//     // Do not exit; function will handle errors per request
//   }
// })();

// 2. Middleware
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        "https://aura-sphere-4n42.vercel.app",
        "https://aura-sphere-4n42.vercel.app/",
      ];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    allowedHeaders: "Content-Type,Authorization",
  })
);

// Handle preflight requests
app.options("*", cors());

// delete this 

// src/index.js (just after app.use(session(...)) and before app.use(passport.initialize()))
// app.use(async (req, res, next) => {
//   // If not yet connected (1 = connected)
//   if (mongoose.connection.readyState !== 1) {
//     try {
//       await connectDB();     // wait for DB to connect
//       console.log("MongoDB connected (middleware)");
//     } catch (err) {
//       console.error("DB connection error (middleware):", err);
//       return res.status(500).json({ message: "Database connection failed" });
//     }
//   }
//   next();
// });

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: true, // 
      sameSite: "none", // ✅ needed for cross-site cookies
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);




app.use(passport.initialize());
app.use(passport.session());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// 3. Health check route to avoid 404 on root
app.get("/", (req, res) => {
  res.status(200).json({ message: "AuraSphere Backend API is running ✅" });
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


app.use("/api/auth", auth);   //addded now /api 
app.use("/api/userinfo", userRouter);
app.use("/api/leaderboard", lead);
app.use("/api/user/points", addPt);
// app.use("/userr", lead);
// app.use("/user", goalRouter);
app.use("/api/goals", goalRouter);
app.use("/api/courses", courseRouter);
app.use("/api/gamification", challengeRoutes);
// app.use("/gamification", gamificationRouter);


// 5. Error handler (moved after routes)
app.use(errorHandler);

// 6. 404 fallback
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// 7. Export the app (no app.listen)
export default app;
