import express from 'express';
import { Assignment } from '../models/assignment.model.js';
import { User } from '../models/user.model.js';
import protect from '../middleware/auth.js';

const router = express.Router();

// Get all assignments for the authenticated user
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await User.findById(userId).populate('dueassignments').populate('completedassignments');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // merge assignments with status flags
    const due = (user.dueassignments || []).map(a => ({ ...a.toObject(), status: 'pending' }));
    const completed = (user.completedassignments || []).map(a => ({ ...a.toObject(), status: 'completed' }));
    const all = [...due, ...completed];

    res.json({ assignments: all });
  } catch (err) {
    console.error('Get assignments error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new assignment for the authenticated user
router.post('/', protect, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { title, dueDate, description } = req.body;
    if (!title || !dueDate) return res.status(400).json({ message: 'title and dueDate required' });

    const assignment = await Assignment.create({ title, dueDate: new Date(dueDate), description });
    const user = await User.findById(userId);
    user.dueassignments.push(assignment._id);
    await user.save();

    res.status(201).json({ assignment });
  } catch (err) {
    console.error('Create assignment error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle assignment status (pending <-> completed)
router.put('/:id/toggle', protect, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const assignmentId = req.params.id;
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // toggle status
    assignment.status = assignment.status === 'completed' ? 'pending' : 'completed';
    await assignment.save();

    // update user arrays
    const wasInDue = user.dueassignments.some(id => id.toString() === assignmentId);
    if (assignment.status === 'completed') {
      // move from due to completed
      if (wasInDue) user.dueassignments = user.dueassignments.filter(id => id.toString() !== assignmentId);
      if (!user.completedassignments.some(id => id.toString() === assignmentId)) user.completedassignments.push(assignment._id);
    } else {
      // move back to due
      if (!user.dueassignments.some(id => id.toString() === assignmentId)) user.dueassignments.push(assignment._id);
      user.completedassignments = user.completedassignments.filter(id => id.toString() !== assignmentId);
    }

    await user.save();

    res.json({ assignment });
  } catch (err) {
    console.error('Toggle assignment error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete assignment
router.delete('/:id', protect, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const assignmentId = req.params.id;
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    await Assignment.findByIdAndDelete(assignmentId);
    const user = await User.findById(userId);
    user.dueassignments = user.dueassignments.filter(id => id.toString() !== assignmentId);
    user.completedassignments = user.completedassignments.filter(id => id.toString() !== assignmentId);
    await user.save();

    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('Delete assignment error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
