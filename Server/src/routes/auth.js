import express from "express";
import { Router } from "express";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import protect from "../middleware/auth.js";
import bcrypt from "bcryptjs";
import { upload } from "../middleware/multer.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadToCloudinary } from "../utils/uploadcloud.js";
import passport from "passport";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173"; // default to localhost for dev
const router = Router();

// Test route
router.get("/test", (req, res) => {
  res.send("Auth route is working ✅");
});

// Register route
router.route("/register").post(
  upload.fields([{ name: "avatar", maxCount: 1 }]),
  async (req, res) => {
    const { email, password, username } = req.body;

    try {
      const avatarlocalpath = req.files?.avatar?.[0]?.path;
      let avatarUrl = "https://plus.unsplash.com/premium_photo-1739786996022-5ed5b56834e2?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"; // Default avatar

      if (avatarlocalpath) {
        const avatar = await uploadToCloudinary(avatarlocalpath);
        if (!avatar) {
          return res.status(500).json({ message: "Image upload failed" });
        }
        avatarUrl = avatar.url;
      }

      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ message: "User already exists" });
      }

      const user = await User.create({ username, email, avatar: avatarUrl, password });
      const userResponse = { ...user._doc };
      delete userResponse.password;

      res.status(201).json({ message: "User created", user: userResponse });
    } catch (err) {
      console.error("Registration error:", err.message);
      res.status(500).json({ message: "Failed to register user" });
    }
  }
);

// Login route
router.route("/login").post(async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ message: "Login successful", token });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Failed to login" });
  }
});

// Profile route
router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Profile error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Google OAuth
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${FRONTEND_URL}/login`,
    session: false, // Use JWT, not sessions
  }),
  (req, res) => {
    // On success, create a token
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    // Redirect to the frontend with the token
    res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}`);
  }
);
  // end google callback

// GitHub OAuth
router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));

router.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: `${FRONTEND_URL}/login`, session: false }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

// Logout route - destroys server session and instructs client to clear token
router.post('/logout', (req, res) => {
  req.logout?.();
  req.session?.destroy?.(() => {});
  res.clearCookie('connect.sid');
  res.json({ message: 'Logged out' });
});

export default router;