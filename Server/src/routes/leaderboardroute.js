import express from 'express';
import {User} from '../models/user.model.js'; // Adjust path as necessary
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { getLeaderboard } from '../controller/userController.js';
const router = Router();

// Serve leaderboard at the router root so mounting at /api/leaderboard
// results in GET /api/leaderboard
router.get('/', getLeaderboard);

export default router;