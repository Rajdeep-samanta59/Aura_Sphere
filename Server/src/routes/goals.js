import express from "express";
import { Router } from "express";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import protect from "../middleware/auth.js";
import bcrypt from "bcryptjs";


const router = Router();
// Debug logging for incoming requests to help diagnose 404s
router.use((req, res, next) => {
    console.log('[goals router] incoming', req.method, req.originalUrl);
    next();
});
router.post('/user/:userId/goals', async (req, res) => {
    const { userId } = req.params;
    const { goalId, goalDetails } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const updatedGoals = await user.addOrUpdateGoal(goalId, goalDetails);
        console.log(updatedGoals)
        res.status(200).json({ message: "Goal added/updated successfully", goals: updatedGoals });
    } catch (error) {
        res.status(500).json({ message: "Error updating goal", error });
    }
});

// Alias: accept POST at '/:userId/goals' too (some clients used this path)
router.post('/:userId/goals', async (req, res) => {
    // delegate to the main handler
    req.url = `/user/${req.params.userId}/goals`;
    return router.handle(req, res);
});

router.delete('/user/:userId/goals/:goalId', async (req, res) => {
    const { userId, goalId } = req.params;
  
    try {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });
  
      console.log("User found:", user); 
      const updatedGoals = await user.removeGoal(goalId);
      console.log("Updated Goals:", updatedGoals); 
      res.status(200).json({ message: "Goal removed successfully", goals: updatedGoals });
    } catch (error) {
      console.error("Error removing goal:", error); 
      res.status(500).json({ message: "Error removing goal", error });
    }
  });
  


router.post('/user/:userId/schedule', async (req, res) => {
    const { userId } = req.params;
    const { courseId, courseDetails } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const updatedSchedule = await user.addOrUpdateCourse(courseId, courseDetails);
        res.status(200).json({ message: "Course schedule added/updated successfully", schedule: updatedSchedule });
    } catch (error) {
        res.status(500).json({ message: "Error updating course schedule", error });
    }
});

// Alias delete
router.delete('/:userId/goals/:goalId', async (req, res) => {
    req.url = `/user/${req.params.userId}/goals/${req.params.goalId}`;
    return router.handle(req, res);
});

router.delete('/user/:userId/schedule/:courseId', async (req, res) => {
    const { userId, courseId } = req.params;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const updatedSchedule = await user.removeCourse(courseId);
        res.status(200).json({ message: "Course removed from schedule", schedule: updatedSchedule });
    } catch (error) {
        res.status(500).json({ message: "Error removing course from schedule", error });
    }
});

router.put('/user/:userId/goals/:goalId', protect, async (req, res) => {
    const { userId, goalId } = req.params;
  
    try {
    const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });
  
      const goal = user.academicGoals.id(goalId);
      if (!goal) return res.status(404).json({ message: "Goal not found" });
  
      // Toggle the completed status
      goal.completed = !goal.completed;
  
      await user.save();
      res.json({ message: "Goal status updated", goal });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
});

// Alias put (older clients)
router.put('/:userId/goals/:goalId', protect, async (req, res) => {
    req.url = `/user/${req.params.userId}/goals/${req.params.goalId}`;
    return router.handle(req, res);
});
  
  

router.get('/user/:userId/goals', async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const goalsWithProgress = await user.getGoalsWithProgress();
        res.status(200).json({ goals: goalsWithProgress });
    } catch (error) {
        res.status(500).json({ message: "Error fetching goals with progress", error });
    }
});
export default router;
