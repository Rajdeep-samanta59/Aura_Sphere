import express from "express";
import { Router } from "express";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import protect from "../middleware/auth.js";
import bcrypt from "bcryptjs";
import {upload} from "../middleware/multer.js";
import {ApiError} from "../utils/ApiError.js";
import { uploadToCloudinary } from "../utils/uploadcloud.js";

import dotenv from 'dotenv';
dotenv.config({ path: './.env' });
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const router = Router();

router.get("/test", (req, res) => {
  res.send("Auth route is working ✅");
});

router.route("/register").post(upload.fields([
    { name: "avatar", maxCount: 1 }
]), async (req, res) => {
    const { email, password, username } = req.body;

    try {
        const avatarlocalpath = req.files?.avatar[0]?.path;
        console.log("avatarlocalpath:", avatarlocalpath);
        
        if (!avatarlocalpath) {
            return res.status(400).json({ message: "Avatar is required" });
        }
        
        const avatar = await uploadToCloudinary(avatarlocalpath);
        if (!avatar) {
            return res.status(500).json({ message: "Image upload failed" });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({ username, email, avatar: avatar.url, password });
        const createduser = await User.findById(user._id).select("-password");
        
        if (!createduser) {
            return res.status(500).json({ message: "User creation failed" });
        }

        // Return a message without the token, so the user is not automatically logged in
        res.status(201).json({ message: 'User created' });
    } catch (err) {
        console.error("Error with User.findOne:", err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});


router.route("/login").post(async (req, res) => {
    const { email, password } = req.body;
    try {
        console.log("Login attempt with email:", email);
        const user = await User.findOne({ email });
        if (!user) {
            console.log("User not found");
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            console.log("Password mismatch");
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        console.log("Login successful, token generated");
        res.json({ message: 'Login successful', token });
    } catch (error) {
        console.error("Error during login:", error.message);
        res.status(500).json({ message: 'Server error' });
    }
});
router.get('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

import passport from 'passport';
// Auth with Google
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));


// Callback route for Google
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        // Successful authentication, redirect home.
        // res.redirect(`http://localhost:5173/home`);
        //  // Redirect to your frontend or a success page berore deploy
        res.redirect(`${FRONTEND_URL}/home`);
    }
);

// Auth with GitHub

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));


// GitHub callback route
router.get('/github/callback', passport.authenticate('github', { failureRedirect: '/' }),
    (req, res) => {
        // res.redirect(`http://localhost:5173/home`); // Redirect to a frontend route or success page
        
        res.redirect(`${FRONTEND_URL}/home`);
    }
);
router.post("/signup", (req, res) => {
  res.json({ message: "Signup works ✅" });
});

export default router;