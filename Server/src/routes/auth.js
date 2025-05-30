import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import passport from "passport";
import { User } from "../models/user.model.js";
import protect from "../middleware/auth.js";
import { upload } from "../middleware/multer.js";
import { uploadToCloudinary } from "../utils/uploadcloud.js";

const router = Router();

// Test Route
router.get("/test", (req, res) => res.send("Auth route is working ✅"));

// Register
router.post(
  "/register",
  upload.fields([{ name: "avatar", maxCount: 1 }]),
  async (req, res) => {
    try {
      const { username, email, password } = req.body;
      if (!req.files?.avatar) {
        return res.status(400).json({ message: "Avatar is required" });
      }
      const avatar = await uploadToCloudinary(req.files.avatar[0].path);
      if (!avatar) throw new Error("Image upload failed");

      if (await User.findOne({ email })) {
        return res.status(400).json({ message: "User already exists" });
      }
      const hashed = await bcrypt.hash(password, 10);
      const user = await User.create({ username, email, password: hashed, avatar: avatar.url });
      return res.status(201).json({ message: "User created" });
    } catch (err) {
      console.error("Signup Error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.json({ message: "Login successful", token });
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Protected Profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    return res.json(user);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// OAuth
const FRONTEND_URL = process.env.FRONTEND_URL;
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => res.redirect(`${FRONTEND_URL}/home`)
);
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback', passport.authenticate('github', { failureRedirect: '/' }),
  (req, res) => res.redirect(`${FRONTEND_URL}/home`)
);

export default router;